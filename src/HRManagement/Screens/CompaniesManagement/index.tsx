import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Space, Tooltip, message, Spin} from 'antd';
import {TbPencil, TbTrash, TbSearch, TbUsersGroup} from 'react-icons/tb';
import axios from 'axios';

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

  const columns = [
    {
      title: 'RUC / UID',
      dataIndex: 'legal_uid',
      width: 110,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
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
      title: 'Acciones',
      dataIndex: 'uuid',
      width: 120,
      render: (uuid: string, record: any) => (
        <Space wrap size={"small"}>
          <Tooltip title={'Editar'}>
            <IconButton
              small
              icon={<TbPencil/>}
              onClick={() => navigate(`/companies/${uuid}/info`)}
            />
          </Tooltip>
          <Tooltip title={'Empleados'}>
            <IconButton
              small
              icon={<TbUsersGroup/>}
              onClick={() => navigate(`/companies/${uuid}/employees`)}
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
              <IconButton icon={<TbTrash/>} small danger/>
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
          title={'Empresas'}
          tools={`${pagination?.total || 0} compañías encontradas`}
          onAdd={() => setOpenCreateCompany(true)}
          description={'Directorio de empresas con las que trabajas'}
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
          }}
          destroyOnHidden
          footer={false}
        >
          <CompanyForm onComplete={() => {
            setOpenCreateCompany(false);
            setReload(!reload);
          }}/>
        </Modal>
      </ModuleContent>
    </>
  );
};

export default CompaniesManagement;
