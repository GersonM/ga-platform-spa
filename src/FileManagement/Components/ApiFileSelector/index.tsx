import React, {useEffect, useState} from 'react';
import {Col, Row} from "antd";

import type {ApiFile} from "../../../Types/api.tsx";
import FileUploader from "../FileUploader";
import ModalView from "../../../CommonUI/ModalView";
import ContainersTreeNavigator from "../ContainersTreeNavigator";
import ContainerContentViewer from "../ContainerContentViewer";
import './styles.less';
import useGetApiFile from "../../Hooks/useGetApiFile.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import FileSize from "../../../CommonUI/FileSize";
import IconButton from "../../../CommonUI/IconButton";
import {TbSearch} from "react-icons/tb";

interface ApiFileSelectorProps {
  value?: string;
  filter?: string;
  showPreview?: boolean;
  onChange?: (value: string, file: ApiFile) => void;
}

const ApiFileSelector = ({value, onChange, showPreview = true}: ApiFileSelectorProps) => {
  const [openFileNavigator, setOpenFileNavigator] = useState(false);
  const [currentContainer, setCurrentContainer] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<ApiFile>();
  const {fileInformation, getApiFile, loading} = useGetApiFile();
  const [uploaderEnabled, setUploaderEnabled] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: any) => {
      e.preventDefault();
      setUploaderEnabled(true);
    };

    // 2. Detectar cuando el archivo sale de la ventana
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      setUploaderEnabled(false);
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragend', handleDragLeave);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragend', handleDragLeave);
    };

  }, []);

  useEffect(() => {
    if (value && !selectedFile) {
      getApiFile(value);
    }
  }, [value]);

  const file: ApiFile | undefined = selectedFile || fileInformation;

  return (
    <div className={'api-file-selector-container'}>
      <LoadingIndicator visible={loading}/>
      {showPreview &&
        <div className="preview" style={{backgroundImage: `url(${file?.thumbnail})`}}
             onClick={() => setOpenFileNavigator(true)}/>
      }
      <div className={'file-information'} onClick={() => setOpenFileNavigator(true)}>
        <span className={'file-name'}>{file?.name || 'Elige un archivo o sube uno nuevo'}</span>
        <small>{file ? <FileSize size={file?.size}/> : ''}</small>
      </div>

      <IconButton title={'Buscar en la librería de archivos'} icon={<TbSearch/>}
                  onClick={() => setOpenFileNavigator(true)}/>
        <FileUploader
          small
          showPreview={false}
          clearOnFinish
          showMessage={uploaderEnabled}
          onChange={(uuid, fileUploaded) => {
            setOpenFileNavigator(false);
            setSelectedFile(fileUploaded);
            onChange?.(uuid, fileUploaded);
          }}/>
      <ModalView
        title={'Elige el archivo'}
        width={900}
        open={openFileNavigator}
        onCancel={() => setOpenFileNavigator(false)}
      >
        <p style={{opacity: 0.7}}>Ha doble clic sobre el archivo para seleccionarlo</p>
        <Row gutter={[20, 20]}>
          <Col span={7}>
            <div className={'folder-selector-column'}>
              <ContainersTreeNavigator value={currentContainer} onChange={value => setCurrentContainer(value)}/>
            </div>
          </Col>
          <Col span={17}>
            <ContainerContentViewer
              filter={'image'}
              containerUuid={currentContainer}
              onFolderNavigate={(c) => {
                setCurrentContainer(c.uuid);
                console.log(c.uuid);
              }}
              onFileExecuted={(file) => {
                setOpenFileNavigator(false);
                setSelectedFile(file);
                onChange?.(file.uuid, file);
              }}
            />
          </Col>
        </Row>
      </ModalView>
    </div>
  );
};

export default ApiFileSelector;
