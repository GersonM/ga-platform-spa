import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Space, Tooltip, Button, Row, Col, message, Spin} from 'antd';
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

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCreateCompany, setOpenCreateCompany] = useState(false);
  const [openEditCompany, setOpenEditCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [rucLoading, setRucLoading] = useState(false);

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

  const consultarRUC = async (ruc: string, form: any) => {
    if (!ruc || ruc.length < 8) return;

    setRucLoading(true);
    try {
      const response = await axios.get(`hr-management/companies/lookup-ruc/${ruc}`);

      if (response.data && response.data.success) {
        const data = response.data.data;
        form.setFieldsValue({
          legal_name: data.razon_social,
          legal_address: data.direccion,
          name: data.razon_social || form.getFieldValue('name'),
        });
        message.success('Datos encontrados y cargados automáticamente');
      } else {
        message.warning('No se encontraron datos para este RUC');
      }
    } catch (error) {
      console.error('Error consultando RUC:', error);
      message.error('Error al consultar el RUC');
    } finally {
      setRucLoading(false);
    }
  };

  const handleRucChange = (value: string, form: any) => {
    const cleanRuc = value.replace(/[^0-9]/g, '');
    form.setFieldValue('legal_uid', cleanRuc);
    if (cleanRuc.length === 11) {
      consultarRUC(cleanRuc, form);
    }
  };

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
    setEditingCompany(company);
    editForm.setFieldsValue({
      name: company.name,
      email: company.email,
      phone: company.phone,
      legal_name: company.legal_name,
      legal_uid: company.legal_uid,
      legal_address: company.legal_address,
    });
    setOpenEditCompany(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingCompany) return;

    try {
      setLoading(true);
      await axios.put(`hr-management/companies/${editingCompany.uuid}`, values);
      message.success('Empresa actualizada exitosamente');
      setReload(!reload);
      setOpenEditCompany(false);
      setEditingCompany(null);
      editForm.resetFields();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error updating company:', error);
      message.error('Error al actualizar la empresa');
    }
  };

  const handleCancelEdit = () => {
    setOpenEditCompany(false);
    setEditingCompany(null);
    editForm.resetFields();
  };



  const handleCancelCreate = () => {
    setOpenCreateCompany(false);
    createForm.resetFields();
  };

  const columns = [
    {
      title: 'RUC / UID',
      dataIndex: 'legal_uid',
      width: 180,
      render: (legal_uid: string) => legal_uid || <span style={{ color: '#999' }}>No especificado</span>
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 200,
      render: (name: string, row: any) => (
        <a onClick={() => handleEdit(row)} style={{ cursor: 'pointer' }}>
          {name}
        </a>
      ),
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
              icon={<TbPencil />}
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
              <IconButton icon={<TbTrash />} danger />
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
          onCancel={handleCancelCreate}
          footer={false}
        >
          <CompanyForm />
        </Modal>
      </ModuleContent>
    </>
  );
};

export default CompaniesManagement;
