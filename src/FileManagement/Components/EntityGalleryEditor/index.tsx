import React, {useEffect, useState} from 'react';
import {TbPhotoCancel, TbPhotoCheck, TbTrash} from "react-icons/tb";
import {Popconfirm, Space} from "antd";
import axios from "axios";

import type {ApiFile} from "../../../Types/api.tsx";
import FileUploader from "../FileUploader";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';

interface EntityGalleryEditorProps {
  value?: ApiFile[];
  onChange?: (value: string[]) => void;
}

const EntityGalleryEditor = ({value = [], onChange}: EntityGalleryEditorProps) => {
  const [gallery, setGallery] = useState<ApiFile[] | undefined | null>(value);

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
      })
      .catch((err) => {
        ErrorHandler.showNotification(err);
      })
  }

  return (
    <div className={'file-gallery-editor'}>
      {gallery?.map((item, index) => {
        return <div
          className={`file-gallery-item ${item.code}`}
          style={{backgroundImage: 'url(' + item.thumbnail + ')'}}
          key={index}>
          <div className="actions">
            <Space>
              {item.code != 'cover' ?
                <IconButton
                  icon={<TbPhotoCheck color={'#ffffff'}/>} title={'Usar imagen como portada'}
                  onClick={() => setAsCover(item, 'cover')}/> :
                <IconButton icon={<TbPhotoCancel/>} title={'Quitar imagen como portada'}
                            onClick={() => setAsCover(item, 'public')}/>
              }
              <Popconfirm title={'¿Quiere eliminar esta imagen?'} onConfirm={() => deleteImage(item)}>
                <IconButton icon={<TbTrash/>} danger/>
              </Popconfirm>
            </Space>
          </div>
        </div>;
      })}
      <FileUploader small multiple clearOnFinish showPreview={false} onChange={(fileUuid, fileData) => {
        const newGallery = gallery ? [...gallery] : [];
        newGallery.push(fileData);
        setGallery(newGallery);
      }}/>
    </div>
  );
};

export default EntityGalleryEditor;
