import React, {useState} from 'react';
import {TbPlus} from "react-icons/tb";
import {Card, Checkbox, Form, Input, Select, Space} from "antd";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import CustomTag from "../../../CommonUI/CustomTag";
import ModalView from "../../../CommonUI/ModalView";

const ProcessesManagement = () => {
  const [openProcessForm, setOpenProcessForm] = useState(false);

  return (
    <div>
      <ModuleContent>
        <ContentHeader
          title={'Procesos'}
          onAdd={() => setOpenProcessForm(true)}
        >
          <FilterForm>
            <Form.Item name={'process_uuid'} label={'Proceso'}>
              <Select options={[
                {label: 'Proceso regular', value: '1'},
                {label: 'Ventas cliente', value: '2'},
              ]}/>
            </Form.Item>
          </FilterForm>
        </ContentHeader>
        <Card variant={'borderless'} title={<><CustomTag>Proceso</CustomTag> Nuevos clientes</>} size={"small"}
              style={{marginBottom: 20}}>
          <Space>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'Nuevo lead'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'En contacto'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'Visita Agendada'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
          </Space>
        </Card>
        <Card variant={'borderless'} title={<><CustomTag>Proceso</CustomTag> Venta</>} size={"small"}
              style={{marginBottom: 20}}>
          <Space>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'Nuevo venta'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'Firma de contrato'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
            <Card size={"small"} extra={<CustomTag>1</CustomTag>} title={'Entrega de propiedad'}>
              2 documentos requeridos <br/>
              1 documento opcional <br/>
              10 usuarios en este proceso
            </Card>
          </Space>
        </Card>
      </ModuleContent>
      <ModalView open={openProcessForm} onCancel={() => setOpenProcessForm(false)}>
        <h2>Nuevo proceso</h2>
        <Form layout={'vertical'}>
          <Form.Item name={'name'} label={'Nombre del proceso'}>
            <Input/>
          </Form.Item>
          <Form.Item name={'description'} label={'Descripción'}>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item name={'name'} label={'Proceso padre (opcional)'}>
            <Select placeholder={'Ninguno'} options={[
              {label: 'Proceso 1', value: '1'},
            ]}/>
          </Form.Item>
          <Form.Item name={'name'}>
            <Checkbox>Habilitar visualización para los usuarios</Checkbox>
          </Form.Item>
          <Form.Item name={'name'}>
            <Checkbox>Requerir aprobación para nuevas asignaciones</Checkbox>
          </Form.Item>
          <PrimaryButton icon={<TbPlus/>} label={'Agregar proceso'} block htmlType={'submit'}/>
        </Form>
      </ModalView>
    </div>
  );
};

export default ProcessesManagement;
