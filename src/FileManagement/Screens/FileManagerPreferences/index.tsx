import {useContext} from 'react';
import {Button, Col, Divider, Row} from "antd";

import FileUploader from '../../Components/FileUploader';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import UploadContext from '../../../Context/UploadContext';
import FileSize from '../../../CommonUI/FileSize';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

const FileManagerPreferences = () => {
  const {fileList, isUploading} = useContext(UploadContext);
  return (
    <div>
      <ContentHeader title={'Configuración de almacenamiento'} />
      <LoadingIndicator message={'Uploading...'} overlay={false} visible={isUploading} />
      <Divider>Configuración</Divider>
      <Row align={'middle'} gutter={[30, 30]}>
        <Col md={6} xs={9}>
          <span className={'label'}>Carpeta de subida de archivos</span>
          <small>Carpeta de carga de archivos que no se llegaron a completar</small>
        </Col>
        <Col md={8} xs={12}>
          <FileSize size={14000000000}/>
        </Col>
        <Col md={8} xs={12}>
          <Button>Limpiar carpeta de descargas</Button>
        </Col>
        <Col md={6} xs={9}>
          <span className={'label'}>Carpeta de archivos temporales</span>
          <small>Carpeta de carga de archivos que no se llegaron a completar</small>
        </Col>
        <Col md={8} xs={12}>
          <FileSize size={130000000}/>
        </Col>
        <Col md={8} xs={12}>
          <Button>Limpiar carpeta de descargas</Button>
        </Col>
      </Row>

      <Divider>Prueba de subida de archivos</Divider>
      <FileUploader showPreview multiple onChange={uuid => console.log('uploaded', uuid)} />
      <div>
        <ul>
          {fileList?.map((item, index) => (
            <li key={index}>
              {item.file.name} - <FileSize size={item.file.size} />
              <br />
              <small>
                {item.hash} | {item.progress}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileManagerPreferences;
