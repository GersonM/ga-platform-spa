import React, {useState} from 'react';
import {Button, Col, Divider, List, Modal, Row, Tag} from "antd";
import {TbCircleCheckFilled, TbClockFilled, TbFileExport, TbPrinter} from "react-icons/tb";
import axios from "axios";

import type {Profile, SubscriptionMember} from "../../../Types/api.tsx";
import FileUploader from "../../../FileManagement/Components/FileUploader";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import './styles.less';
import CustomTag from "../../../CommonUI/CustomTag";

interface ProcessDetailProps {
  entityUuid: string;
  type: string;
  profile: Profile;
}

const list = [
  {name: 'FICHA DEL COMPRADOR', status: 'Aprobado', description: 'FICHA DEL COMPRADOR'},
  {name: 'DNI DEL TITULAR', status: 'Aprobado', description: 'DNI DEL TITULAR'},
  {name: 'DNI DE LA CARGA FAMILIAR', status: 'Aprobado', description: 'DNI DE LA CARGA FAMILIAR'},
  {name: 'BOLETAS', status: 'Aprobado', description: 'BOLETAS'},
  {name: 'VOUCHER', status: 'Aprobado', description: 'VOUCHER'},
  {
    name: 'CONTRATO DE PROMESA DE COMPRAVENTA DE BIEN FUTURO',
    status: 'Aprobado',
    description: 'CONTRATO DE PROMESA DE COMPRAVENTA DE BIEN FUTURO'
  },
  {name: 'RECIBO DE AGUA O LUZ', status: 'Pendiente', description: 'RECIBO DE AGUA O LUZ'},
  {
    name: 'FORMULARIO DE INSCRIPCIÓN DE TECHO PROPIO',
    status: 'Pendiente',
    description: 'FORMULARIO DE INSCRIPCIÓN DE TECHO PROPIO'
  },
  {
    name: 'SOLICITUD DE ASIGNACIÓN DE BONO FAMILIAR HABITACIONAL',
    status: 'Pendiente',
    description: 'SOLICITUD DE ASIGNACIÓN DE BONO FAMILIAR HABITACIONAL'
  },
  {name: 'ANEXO 1 ESPECIFICACIONES GENERALES', status: 'Pendiente', description: 'ANEXO 1 ESPECIFICACIONES GENERALES'},
  {name: 'ANEXO 2 ESPECIFICACIONES TÉCNICAS', status: 'Pendiente', description: 'ANEXO 2 ESPECIFICACIONES TÉCNICAS'},
  {
    name: 'MINUTA DE COMPRAVENTA DEL BIEN FUTURO',
    status: 'Pendiente',
    description: 'MINUTA DE COMPRAVENTA DEL BIEN FUTURO'
  },
  {name: 'CARTA DE ACREDITACIÓN DE AHORROS', status: 'Pendiente', description: 'CARTA DE ACREDITACIÓN DE AHORROS'},
  {name: 'FORMULARIO 007', status: 'Pendiente', description: 'FORMULARIO 007'},
  {
    name: 'CONSTANCIA DE DESEMBOLSO DE LA COOPERTATIVA(opcional)',
    status: 'Pendiente',
    description: 'CONSTANCIA DE DESEMBOLSO DE LA COOPERTATIVA(opcional)'
  },
  {
    name: 'CONTRATO EXTRA JUDICIAL (POR EL FINACIAMIENTO CON LA COOPERATIVA)',
    status: 'Aprobado',
    description: 'CONTRATO EXTRA JUDICIAL (POR EL FINACIAMIENTO CON LA COOPERATIVA)'
  },
];
const listProvision = [
  {name: 'FICHA DEL COMPRADOR', status: 'Aprobado', description: 'FICHA DEL COMPRADOR'},
  {name: 'DNI DEL TITULAR', status: 'Aprobado', description: 'DNI DEL TITULAR'},
  {
    name: 'DNI (DE LA PAREJA EN EL CASO ESTE CASAD@)',
    status: 'Aprobado',
    description: 'DNI (DE LA PAREJA EN EL CASO ESTE CASAD@)'
  },
  {name: 'BOLETAS', status: 'Aprobado', description: 'BOLETAS'},
  {name: 'VOUCHER', status: 'Aprobado', description: 'VOUCHER'},
  {
    name: 'CONTRATO DE PROMESA DE OPCIÓN DE COMPRAVENTA DE BIEN FUTURO',
    status: 'Aprobado',
    description: 'CONTRATO DE PROMESA DE OPCIÓN DE COMPRAVENTA DE BIEN FUTURO'
  },
  {name: 'RECIBO DE AGUA O LUZ', status: 'Aprobado', description: 'RECIBO DE AGUA O LUZ'},
  {
    name: 'ANEXO DE ESPECIFICACIONES GENERALES y MINUTA',
    status: 'Aprobado',
    description: 'ANEXO DE ESPECIFICACIONES GENERALES y MINUTA'
  },
  {
    name: 'CONSTANCIA DE DESEMBOLSO DE LA COOPERTATIVA (OPCIONAL)',
    status: 'Aprobado',
    description: 'CONSTANCIA DE DESEMBOLSO DE LA COOPERTATIVA (OPCIONAL)'
  },
  {
    name: 'CONTRATO EXTRA JUDICIAL (POR EL FINACIAMIENTO CON LA COOPERATIVA)',
    status: 'Aprobado',
    description: 'CONTRATO EXTRA JUDICIAL (POR EL FINACIAMIENTO CON LA COOPERATIVA)'
  },
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

  return (
    <>
      <Row gutter={20}>
        <Col xs={12}>
          <PrimaryButton
            block
            icon={<TbPrinter/>}
            label={'Imprimir documentos'} onClick={generateDocuments}/>
        </Col>
        <Col xs={12}>
          <PrimaryButton
            block
            icon={<TbFileExport/>}
            label={'Exportar documentos'} onClick={generateDocuments}/>
        </Col>
      </Row>
      <Divider>Techo Propio o al contado</Divider>
      <List
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <FileUploader/>,
              item
                .status == 'Aprobado' ?
                <Button size={"small"}>Marca como pendiente</Button> :
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
              title={item.name}
              description={
                <>{item.description} <br/>{item.status == 'Aprobado' ? <Tag color={'green'}>Aprobado por Gerson</Tag> :<Tag>Pendiente</Tag>}</>
              }
            />
          </List.Item>
        )}
      />
      <Divider>Terreno vacío (Sin módulo)</Divider>
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
              <>{item.description} <br/><CustomTag>{item.status}</CustomTag></>
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
        <LoadingIndicator visible={downloading}/>
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} frameBorder="0"></iframe>}
      </Modal>
    </>
  );
};

export default ProcessDetail;
