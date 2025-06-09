import {useState} from 'react';
import {_PiFunnelBold} from 'react-icons/pi';
import {TrashIcon, EyeIcon} from '@heroicons/react/24/outline';
import {Form, Modal, Popconfirm, Progress, Select, Space, Table} from 'antd';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import type {EntityActivity} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import FilterForm from '../../../CommonUI/FilterForm';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyString from '../../../CommonUI/MoneyString';
import {CheckIcon} from '@heroicons/react/24/solid';
import BulkEstateUpdate from '../../Components/BulkEstateUpdate';
import {useNavigate} from 'react-router-dom';

const tmp = [
  {
    uuid: '1',
    stage: 'I',
    registry_entry: '252345',
    address: 'A12',
    area: '100',
    price: 20000000,
    status: 'building',
    progress: 35,
    type: 'Modelo A',
  },
  {
    uuid: '2',
    stage: 'II',
    registry_entry: '129898',
    address: 'A12',
    area: '100',
    price: 18000000,
    status: 'stopped',
    progress: 85,
    type: 'Modelo B',
  },
  {
    uuid: '3',
    stage: 'II',
    registry_entry: '129898',
    address: 'A12',
    area: '100',
    price: 18000000,
    status: 'stopped',
    progress: 85,
    type: 'Modelo B',
  },
];

const EstatesManager = () => {
  const [loading, _setLoading] = useState(false);
  const [estates, _setEstates] = useState<any[]>(tmp);
  const [reload, setReload] = useState(false);
  const [selectedEstates, setSelectedEstates] = useState<string[]>();
  const [openBulkUpdate, setOpenBulkUpdate] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      dataIndex: 'stage',
      title: 'Etapa',
      width: 55,
    },
    {
      dataIndex: 'address',
      title: 'Dirección',
      width: 90,
    },
    {
      dataIndex: 'registry_entry',
      title: 'Partida registral',
      width: 120,
    },
    {
      dataIndex: 'area',
      title: 'Área',
      width: 75,
      render: (area: string) => {
        return area + ' m2';
      },
    },
    {
      dataIndex: '_price',
      title: 'Valor del terreno',
      render: (price: number) => {
        return <MoneyString value={_price} />;
      },
    },
    {
      dataIndex: 'documents',
      title: 'Documentos',
      width: 110,
      render: (price: number) => {
        return '10%';
      },
    },
    {
      dataIndex: 'activity',
      title: 'Actividades',
      width: 110,
      render: (price: number) => {
        return '20%';
      },
    },
    {
      width: 90,
      dataIndex: 'status',
      title: 'Estado contrato',
    },
    {
      dataIndex: 'progress',
      title: 'Avance',
      render: (progress: number) => {
        return (
          <Progress
            strokeColor={{
              '0%': '#ffa03a',
              '50%': '#29e312',
            }}
            percent={progress}
          />
        );
      },
    },
    {
      dataIndex: 'uuid',
      title: 'Acciones',
      width: 100,
      render: (uuid: string, row: EntityActivity) => {
        return (
          <Space>
            <IconButton small icon={<EyeIcon />} onClick={() => navigate(`/real-estate/estates/${uuid}`)} />
            <Popconfirm title={'¿Seguro que quieres eliminar esta propiedad?'}>
              <IconButton small danger icon={<TrashIcon />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  console.log(selectedEstates);

  return (
    <ModuleContent>
      <ContentHeader
        title={'Propiedades'}
        onRefresh={() => setReload(!reload)}
        tools={
          <Space>
            {estates.length} propiedades
            <PrimaryButton
              size={'small'}
              icon={<CheckIcon />}
              label={'Actualizar selección actual'}
              onClick={() => setOpenBulkUpdate(true)}
            />
          </Space>
        }
      />
      <FilterForm>
        <Form.Item label={'Proyecto'} name={'stage'}>
          <Select
            placeholder={'Todas'}
            allowClear
            style={{width: 100}}
            options={[
              {label: 'Etapa IV', value: 'IV'},
              {label: 'Etapa III', value: 'III'},
              {label: 'Etapa II', value: 'II'},
              {label: 'Etapa I', value: 'I'},
            ]}
          />
        </Form.Item>
        <Form.Item label={'Manzána'} name={'block'}>
          <Select
            placeholder={'Todas'}
            allowClear
            style={{width: 100}}
            options={[
              {label: 'Etapa IV', value: 'IV'},
              {label: 'Etapa III', value: 'III'},
              {label: 'Etapa II', value: 'II'},
              {label: 'Etapa I', value: 'I'},
            ]}
          />
        </Form.Item>
        <Form.Item label={'Estado'} name={'status'}>
          <Select
            placeholder={'Todas'}
            allowClear
            style={{width: 120}}
            options={[
              {label: 'En construcción', value: 'building'},
              {label: 'Disponible', value: 'available'},
              {label: 'Vendido', value: 'sell'},
            ]}
          />
        </Form.Item>
      </FilterForm>
      <Table
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows: any[]) => {
            // @ts-ignore
            setSelectedEstates(selectedRowKeys);
          },
        }}
        rowKey={'uuid'}
        size="small"
        scroll={{x: 1200}}
        loading={loading}
        columns={columns}
        dataSource={estates}
        pagination={false}
      />
      <Modal
        open={openBulkUpdate}
        footer={false}
        title={'Actualización por lotes'}
        onCancel={() => setOpenBulkUpdate(false)}>
        <BulkEstateUpdate />
      </Modal>
    </ModuleContent>
  );
};

export default EstatesManager;
