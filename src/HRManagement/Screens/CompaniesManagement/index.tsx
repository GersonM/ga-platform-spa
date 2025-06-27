import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Space, Tooltip, message, Spin} from 'antd';
import {TbPencil, TbTrash, TbSearch} from 'react-icons/tb';
import axios from 'axios';
import dayjs from "dayjs";

import ModuleContent from '../../../CommonUI/ModuleContent';
import IconButton from '../../../CommonUI/IconButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import FilterForm from '../../../CommonUI/FilterForm';
import TableList from "../../../CommonUI/TableList";
import './styles.less';
import CompanyForm from "../../Components/CompanyForm";
import type {Company} from "../../../Types/api.tsx";

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
  const [selectedCompany, setSelectedCompany] = useState<Company>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, page_size: pageSize, search},
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

  const handleDelete = async (uuid: string) => {
    try {
      setLoading(true);
      await axios.delete(`hr-management/companies/${uuid}`);
      message.success('Empresa eliminada exitosamente');
      setReload(!reload);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error deleting company:', error);
      message.error('Error al eliminar la empresa');
    }
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setOpenCreateCompany(true);
  };

  const columns = [
    {
      title: 'RUC / UID',
      dataIndex: 'legal_uid',
      width: 180,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 200,
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
    },
    {
      title: 'Dirección Legal',
      dataIndex: 'legal_address',
    },
    {
      title: 'Creado en',
      dataIndex: 'created_at',
      width: 160,
      render: (created_at: string) => {
        return <Tooltip title={dayjs(created_at).format('DD/MM/YYYY HH:mm a')}>{dayjs(created_at).fromNow()}</Tooltip>;
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string, record: any) => (
        <Space wrap>
          <Tooltip title={'Editar'}>
            <IconButton
              icon={<TbPencil/>}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={'Eliminar'}>
            <Popconfirm
              title={'¿Quieres eliminar esta compañía?'}
              description={'Toda la información relacionada será eliminada también'}
              onConfirm={() => handleDelete(uuid)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
            >
              <IconButton icon={<TbTrash/>} danger/>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ModuleContent>
        <ContentHeader
          loading={loading}
          onRefresh={() => setReload(!reload)}
          title={'Compañías'}
          tools={`${pagination?.total || 0} compañías encontradas`}
          onAdd={() => setOpenCreateCompany(true)}
        />
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
        <TableList
          columns={columns}
          dataSource={companies}
          loading={loading}
          pagination={false}
        />
        <Pagination
          style={{marginTop: 10}}
          align={'center'}
          showSizeChanger={false}
          total={pagination?.total}
          pageSize={pagination?.page_size}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />

        <Modal
          title="Nueva Empresa"
          open={openCreateCompany}
          onCancel={() => {
            setOpenCreateCompany(false);
            setSelectedCompany(undefined);
          }}
          destroyOnHidden
          footer={false}
        >
          <CompanyForm company={selectedCompany} onComplete={() => {
            setOpenCreateCompany(false);
            setReload(!reload);
          }}/>
        </Modal>
      </ModuleContent>
    </>
  );
};

export default CompaniesManagement;
