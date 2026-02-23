import React, {useState} from 'react';
import {Button, Col, Row} from "antd";

import type {ApiFile} from "../../../Types/api.tsx";
import FileUploader from "../FileUploader";
import ModalView from "../../../CommonUI/ModalView";
import ContainersTreeNavigator from "../ContainersTreeNavigator";
import ContainerContentViewer from "../ContainerContentViewer";
import './styles.less';

interface ApiFileSelectorProps {
  value?: string;
  filter?: string;
  onChange?: (value: string, file: ApiFile) => void;
}

const ApiFileSelector = ({value, onChange}: ApiFileSelectorProps) => {
  const [openFileNavigator, setOpenFileNavigator] = useState(false);
  const [currentContainer, setCurrentContainer] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<ApiFile>();

  return (
    <>
      {value}
      <div>
        <Row>
          <Col>
            <Button
              variant={'filled'} type={'text'}
              onClick={() => setOpenFileNavigator(true)}>Elegir archivo</Button>
          </Col>
          <Col>
            <FileUploader fileUuid={selectedFile?.uuid} onChange={(uuid, fileUploaded) => {
              setOpenFileNavigator(false);
              setSelectedFile(fileUploaded);
              onChange?.(uuid, fileUploaded);
            }}/>
          </Col>
        </Row>
      </div>
      <ModalView
        title={'Elige el archivo'}
        width={900}
        open={openFileNavigator} onCancel={() => setOpenFileNavigator(false)}>
        <p style={{opacity:0.7}}>Ha doble clic sobre el archivo para seleccionarlo</p>
        <Row gutter={[20, 20]}>
          <Col span={7}>
            <div className={'folder-selector-column'}>
              <ContainersTreeNavigator onChange={value => setCurrentContainer(value)} />
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
    </>
  );
};

export default ApiFileSelector;
