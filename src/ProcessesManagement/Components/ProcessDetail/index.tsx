import React, {useState} from 'react';
import './styles.less';
import {Avatar, Button, Col, Divider, List, Modal, Row, Tag} from "antd";
import FileUploader from "../../../FileManagement/Components/FileUploader";
import {TbCheck, TbCircleCheck, TbCircleCheckFilled, TbClockFilled, TbFileExport, TbPrinter} from "react-icons/tb";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import axios from "axios";
import dayjs from "dayjs";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {Profile, SubscriptionMember} from "../../../Types/api.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";

interface ProcessDetailProps {
  entityUuid: string;
  type: string;
  profile: Profile;
}

const list = [
  {
    name: `Acta de conformidad`,
    status: 'Aprobado',
    description: 'Documento de conformidad',
  },
  {
    name: `Acta de entrega`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
  {
    name: `Acta de entrega de terreno`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
  {
    name: `Bono primera adenda minuta con múdlo`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
  {
    name: `Acta de conformidad`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
  {
    name: `Terreno compra y venta independización`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
  {
    name: `Terreno compra y venta independización crédito`,
    status: 'Pendiente',
    description: 'Documento de conformidad',
  },
];

const listProvision = [
  {
    name: `Acta de entrega`,
    status: 'Pendiente',
    description: 'Documento de entrega',
  },
  {
    name: `Acta de garantía`,
    status: 'Aprobado',
    description: '',
  },
  {
    name: `Memoria descriptiva`,
    status: 'Pendiente',
    description: '',
  }
];

const ProcessDetail = ({entityUuid, type, profile}: ProcessDetailProps) => {
  const [downloading, setDownloading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [tempURL, setTempURL] = useState<string>();


  const generateDocuments = (subscription: SubscriptionMember) => {
    setOpenPrint(true);
    setDownloading(true);
    axios({
      url: 'document-generator/contract/provision',
      method: 'GET',
      params: {
        profile_uuid: entityUuid,
      },
      responseType: 'blob', // important
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(response.data);
          setTempURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const generateDocumentsss = () => {
    const config = {
      responseType: 'blob',
      params: {
        profile_uuid: entityUuid,
      },
    };

    setDownloading(true);
    axios({
      url: 'document-generator/contract/provision',
      params: config.params,
      method: 'GET',
      responseType: 'blob', // important
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'contratos_' + profile.doc_number + '_' + dayjs().format('D-M-YYYY') + '.pdf';
          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <Row gutter={20}>
        <Col xs={12}>
          <PrimaryButton
            block
            icon={<TbPrinter />}
            label={'Imprimir documentos'} onClick={generateDocuments}/>
        </Col>
        <Col xs={12}>
          <PrimaryButton
            block
            icon={<TbFileExport />}
            label={'Exportar documentos'} onClick={generateDocuments}/>
        </Col>
      </Row>
      <Divider>Área legal</Divider>
      <List
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <FileUploader/>,
              item
                .status == 'Aprobado' ?
                <Button size={"small"}>Cancelar</Button> :
                <Button type={"primary"} ghost size={"small"}>Aprobar</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                item
                  .status == 'Aprobado' ?
                  <TbCircleCheckFilled color={'green'} size={30}/> :
                  <TbClockFilled color={'orange'} size={30}/>
              }
              title={item.name} description={
              <>{item.description} <br/><Tag bordered={false}>{item.status}</Tag></>
            }/>
          </List.Item>
        )}
      />
      <Divider>Entrega</Divider>
      <List
        dataSource={listProvision}
        renderItem={(item) => (
          <List.Item
            actions={[
              <FileUploader/>,
              item
                .status == 'Aprobado' ?
                <Button size={"small"}>Cancelar</Button> :
                <Button type={"primary"} ghost size={"small"}>Aprobar</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                item
                  .status == 'Aprobado' ?
                  <TbCircleCheckFilled color={'green'} size={30}/> :
                  <TbClockFilled color={'orange'} size={30}/>
              }
              title={item.name} description={
              <>{item.description} <br/><Tag bordered={false}>{item.status}</Tag></>
            }/>
          </List.Item>
        )}
      />
      <Modal
        destroyOnHidden
        title={'Contratos'}
        width={'80%'}
        footer={false}
        open={openPrint}
        onCancel={() => {
          setOpenPrint(false);
          setTempURL(undefined);
        }}>
        <LoadingIndicator visible={downloading} />
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} frameBorder="0"></iframe>}
      </Modal>
    </div>
  );
};

export default ProcessDetail;
