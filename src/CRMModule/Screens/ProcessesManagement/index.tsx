import React from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import {Form, Select, Tag} from "antd";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

const stepsList: any[] = [
  {
    uuid: '34kjh2345-234523-fasd345',
    name: 'Saludo baja',
    description: 'Baja de opciones',
    code: 'step_1',
    options: [
      {label: 'Más información', value: '1'},
      {label: 'No quiero más mensajes', value: '1'},
    ],
    steps: [
      {
        uuid: '34kjh2345-234523-fasd345',
        name: 'Enviar más información',
        description: 'Baja de opciones',
        code: 'mas_info',
        steps: null,
        options: [
          {label: 'Si', value: '1'},
          {label: 'No', value: '1'},
        ],
      },
      {
        uuid: '34kjh2345-234523-fasd345',
        name: 'Enviar más información',
        description: 'Baja de opciones',
        code: 'step_2',
        steps: null,
        options: [
          {label: 'Si', value: '1'},
          {label: 'No', value: '1'},
        ],
      }
    ],
  }
];

const ProcessesManagement = () => {
  return (
    <div>
      <ModuleContent>
        <ContentHeader title={'Procesos'}/>
        <FilterForm>
          <Form.Item name={'process_uuid'} label={'Proceso'}>
            <Select options={[
              {label: 'Proceso regular', value: '1'},
              {label: 'Ventas cliente', value: '2'},
            ]}/>
          </Form.Item>
        </FilterForm>
        <PrimaryButton label={'Agregar proceso'}/>
        {stepsList.map((step, index) => (
          <StepItem key={index} step={step}/>
        ))}
      </ModuleContent>
    </div>
  );
};

const StepItem = ({step}: any) => {
  return <div>
    <h3>
      <Tag bordered={false} color={'lime'}>{step.code}</Tag>
      {step.name}</h3>
    {step.options.map((option: any, index: number) => (
      <div key={index}>{option.label}</div>
    ))}
    {step.steps?.map((s: any, index: number) => (
      <StepItem key={index} step={s}/>
    ))}
  </div>
}

export default ProcessesManagement;
