import React, {useEffect, useRef, useState} from 'react';
import {TbImageInPicture, TbPhotoCancel, TbPhotoCheck, TbTrash} from "react-icons/tb";
import {Popconfirm, Space} from "antd";
import axios from "axios";

import type {ApiFile} from "../../../Types/api.tsx";
import FileUploader from "../FileUploader";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';
import {RiImageAiFill} from "react-icons/ri";
import {sileo} from "sileo";

interface EntityGalleryEditorProps {
  value?: ApiFile[];
  onChange?: (value: string[]) => void;
  allowUpload?: boolean;
}

const EntityGalleryEditor = ({value = [], onChange, allowUpload = true}: EntityGalleryEditorProps) => {
  const [gallery, setGallery] = useState<ApiFile[] | undefined | null>(value);
  const [draggedUuid, setDraggedUuid] = useState<string | null>(null);
  const dragStartGalleryRef = useRef<ApiFile[] | null>(null);
  const dropHandledRef = useRef(false);

  useEffect(() => {
    if (onChange && gallery) {
      onChange(gallery.map(f => f.uuid));
    }
  }, [gallery]);

  const deleteImage = (file: ApiFile) => {
    axios.delete(`/file-management/files/${file.uuid}`)
      .then(() => {
        const newGallery = gallery ? [...gallery] : [];
        newGallery.splice(newGallery.findIndex(f => f.uuid == file.uuid), 1);
        setGallery(newGallery);
      })
      .catch((err) => {
        ErrorHandler.showNotification(err);
      })
  }

  const setAsCover = (file: ApiFile, code: string) => {
    axios.put(`/file-management/files/${file.uuid}`, {code})
      .then(() => {
        const newGallery = gallery ? [...gallery] : [];
        newGallery[newGallery.findIndex(f => f.uuid == file.uuid)].code = code;
        setGallery(newGallery);
        sileo.success({title: 'La imagen se usará como portada'});
      })
      .catch((err) => {
        ErrorHandler.showNotification(err);
      })
  }

  const reorderGallery = (items: ApiFile[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return items;
    }

    const newGallery = [...items];
    const [movedItem] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedItem);

    return newGallery.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
  };

  const handleDragStart = (uuid: string, event: React.DragEvent<HTMLDivElement>) => {
    setDraggedUuid(uuid);
    dropHandledRef.current = false;
    dragStartGalleryRef.current = gallery ? [...gallery] : null;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', uuid);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (targetUuid: string) => {
    if (!draggedUuid) {
      return;
    }

    setGallery((prevGallery) => {
      if (!prevGallery || prevGallery.length === 0) {
        return prevGallery;
      }

      const fromIndex = prevGallery.findIndex(item => item.uuid === draggedUuid);
      const toIndex = prevGallery.findIndex(item => item.uuid === targetUuid);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return prevGallery;
      }

      return reorderGallery(prevGallery, fromIndex, toIndex);
    });
  };

  const handleDrop = (targetUuid: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropHandledRef.current = true;

    const sourceUuid = event.dataTransfer.getData('text/plain') || draggedUuid;
    if (!sourceUuid || !gallery || sourceUuid === targetUuid) {
      setDraggedUuid(null);
      dragStartGalleryRef.current = null;
      return;
    }

    const previousGallery = dragStartGalleryRef.current ? [...dragStartGalleryRef.current] : [...gallery];
    const currentGallery = [...gallery];
    setDraggedUuid(null);

    const hasChanged = previousGallery.map(item => item.uuid).join('|') !== currentGallery.map(item => item.uuid).join('|');
    if (!hasChanged) {
      dragStartGalleryRef.current = null;
      return;
    }

    axios.post('file-management/files/update-order', {
      files: currentGallery.map((item, index) => ({
        uuid: item.uuid,
        order: index + 1,
      })),
    })
      .then(() => {
        sileo.success({title: 'Nuevo orden guardado'});
      })
      .catch((err) => {
        setGallery(previousGallery);
        ErrorHandler.showNotification(err);
      })
      .finally(() => {
        dragStartGalleryRef.current = null;
      });
  };

  const handleDragEnd = () => {
    if (!dropHandledRef.current && dragStartGalleryRef.current) {
      setGallery(dragStartGalleryRef.current);
    }

    setDraggedUuid(null);
    dropHandledRef.current = false;
    dragStartGalleryRef.current = null;
  };

  return (
    <>
      {gallery && gallery.length > 0 && (
        <div className={'file-gallery-editor'}>
          {gallery?.map((item) => {
            return <div
              className={`file-gallery-item ${item.code} ${draggedUuid === item.uuid ? 'dragging' : ''}`}
              style={{backgroundImage: 'url(' + item.thumbnail + ')'}}
              key={item.uuid}
              draggable
              onDragStart={(event) => handleDragStart(item.uuid, event)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(item.uuid)}
              onDrop={(event) => handleDrop(item.uuid, event)}
              onDragEnd={handleDragEnd}>
              <div className={'order-tag'}>{item.order || '-'} {item.code == 'cover' &&
                <RiImageAiFill size={12}/>}</div>
              <div className="actions">
                <Space>
                  {item.code != 'cover' ?
                    <IconButton
                      icon={<TbPhotoCheck color={'#ffffff'}/>} title={'Usar imagen como portada'}
                      onClick={() => setAsCover(item, 'cover')}/> :
                    <IconButton icon={<TbPhotoCancel color={'#ffffff'}/>} title={'Quitar imagen como portada'}
                                onClick={() => setAsCover(item, 'public')}/>
                  }
                  <Popconfirm title={'¿Quiere eliminar esta imagen?'} onConfirm={() => deleteImage(item)}>
                    <IconButton small icon={<TbTrash/>} danger/>
                  </Popconfirm>
                </Space>
              </div>
            </div>;
          })}
        </div>
      )}
      {allowUpload && <>
        <FileUploader small multiple clearOnFinish showPreview={false} onChange={(fileUuid, fileData) => {
          const newGallery = gallery ? [...gallery] : [];
          newGallery.push(fileData);
          setGallery(newGallery);
        }}/>
      </>}
    </>
  );
};

export default EntityGalleryEditor;
