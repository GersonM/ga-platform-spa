import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Select, Space, Table, Tag, Tooltip} from 'antd';
import {TbLockCog, TbPencil, TbTrash, TbUserOff, TbUserShield} from 'react-icons/tb';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import IconButton from '../../../CommonUI/IconButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

import FilterForm from '../../../CommonUI/FilterForm';
import './styles.less';
import dayjs from "dayjs";

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCreateCompany, setOpenCreateCompany] = useState(false);
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: { page: currentPage, page_size: pageSize, search },
    };
    setLoading(true);
    axios
      .get('hr-management/companies', config)
      .then((response) => {
        setLoading(false);
        setCompanies(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error fetching companies:', error);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage, pageSize, search]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 280,
      render: (name: string, row: any) => <a onClick={() => navigate(`/companies/${row.uuid}`)}>{name}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
    },
    {
      title: 'Nombre Legal',
      dataIndex: 'legal_name',
      width: 220,
    },
    {
      title: 'RUC / UID',
      dataIndex: 'legal_uid',
      width: 180,
    },
    {
      title: 'Dirección Legal',
      dataIndex: 'legal_address',
      width: 220,
    },
    {
      title: 'Creado en',
      dataIndex: 'created_at',
      width: 160,
      render: (created_at: string) => {
        return <Tooltip title={dayjs(created_at).format('DD/MM/YYYY HH:mm')}>{dayjs(created_at).fromNow()}</Tooltip>;
      },
    },
    {
      title: 'Actualizado en',
      dataIndex: 'updated_at',
      width: 160,
      render: (updated_at: string) => {
        return <Tooltip title={dayjs(updated_at).format('DD/MM/YYYY HH:mm')}>{dayjs(updated_at).fromNow()}</Tooltip>;
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space wrap>
          <Tooltip title={'Editar'}>
            <IconButton icon={<TbPencil />} onClick={() => navigate(`/companies/${uuid}`)} />
          </Tooltip>
          <Tooltip title={'Eliminar'}>
            <Popconfirm
              title={'¿Quieres eliminar esta compañía?'}
              description={'Toda la información relacionada será eliminada también'}
              onConfirm={() => setReload(!reload)}
            >
              <IconButton icon={<TbTrash />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  // @ts-ignore
  return (
    <div>
      <ModuleContent withSidebar>
        <ContentHeader
          loading={loading}
          onRefresh={() => setReload(!reload)}
          title={'Compañías'}
          tools={`${pagination?.total} compañías encontradas`}
          onAdd={() => setOpenCreateCompany(true)}
        >
          <FilterForm>
            <Form.Item label={'Buscar'}>
              <Input.Search
                allowClear
                placeholder={'Buscar por nombre, email o RUC'}
                onSearch={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
              />
            </Form.Item>
          </FilterForm>
        </ContentHeader>
        <Table
          columns={columns}
          dataSource={companies}
          loading={loading}
          pagination={false}
          rowKey="uuid"
          style={{ width: '100%' }}
        />
        <Pagination
          align={'center'}
          showSizeChanger={false}
          total={pagination?.total}
          pageSize={pagination?.page_size}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          style={{ width: '100%' }} 
        />
        {/*<Modal open={openCreateCompany} destroyOnHidden footer={false} onCancel={() => setOpenCreateCompany(false)}>
          <CreateCompany
            onCompleted={() => {
              setReload(!reload);
              setOpenCreateCompany(false);
            }}
          />
        </Modal>*/}
      </ModuleContent>
    </div>
  );
};

export default CompaniesManagement;
