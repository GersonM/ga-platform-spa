import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Select, Space, Table, Tag, Tooltip, Button, Row, Col} from 'antd';
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
  const [openEditCompany, setOpenEditCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>();
  const [editForm] = Form.useForm();

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

  const handleDelete = async (uuid: string) => {
    try {
      setLoading(true);
      await axios.delete(`hr-management/companies/${uuid}`);
      setReload(!reload);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error deleting company:', error);
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
      setReload(!reload);
      setOpenEditCompany(false);
      setEditingCompany(null);
      editForm.resetFields();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error updating company:', error);
    }
  };

  const handleCancelEdit = () => {
    setOpenEditCompany(false);
    setEditingCompany(null);
    editForm.resetFields();
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 280,
      render: (name: string, row: any) => (
        <a onClick={() => handleEdit(row)} style={{ cursor: 'pointer' }}>
          {name}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => email || <span style={{ color: '#999' }}>Sin email</span>
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      render: (phone: string) => phone || <span style={{ color: '#999' }}>Sin teléfono</span>
    },
    {
      title: 'Nombre Legal',
      dataIndex: 'legal_name',
      width: 220,
      render: (legal_name: string) => legal_name || <span style={{ color: '#999' }}>No especificado</span>
    },
    {
      title: 'RUC / UID',
      dataIndex: 'legal_uid',
      width: 180,
      render: (legal_uid: string) => legal_uid || <span style={{ color: '#999' }}>No especificado</span>
    },
    {
      title: 'Dirección Legal',
      dataIndex: 'legal_address',
      width: 220,
      render: (legal_address: string) => legal_address || <span style={{ color: '#999' }}>No especificada</span>
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
    <div className="companies-management">
      <ModuleContent withSidebar>
        <ContentHeader
          loading={loading}
          onRefresh={() => setReload(!reload)}
          title={'Compañías'}
          tools={`${pagination?.total || 0} compañías encontradas`}
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
          size="small"
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

        {/* Modal para editar empresa */}
        <Modal
          title={`Editar Empresa: ${editingCompany?.name}`}
          open={openEditCompany}
          onCancel={handleCancelEdit}
          width={800}
          footer={[
            <Button key="cancel" onClick={handleCancelEdit}>
              Cancelar
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={() => editForm.submit()}
            >
              Actualizar
            </Button>,
          ]}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nombre de la Empresa"
                  name="name"
                  rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                  <Input placeholder="Nombre de la empresa" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: 'email', message: 'Email no válido' }]}
                >
                  <Input placeholder="Email de contacto" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Teléfono"
                  name="phone"
                >
                  <Input placeholder="Teléfono de contacto" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="RUC/RUT/Documento Legal"
                  name="legal_uid"
                >
                  <Input placeholder="Número de documento legal" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Razón Social"
              name="legal_name"
            >
              <Input placeholder="Razón social de la empresa" />
            </Form.Item>

            <Form.Item
              label="Dirección Legal"
              name="legal_address"
            >
              <Input.TextArea
                rows={3}
                placeholder="Dirección legal completa"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para crear empresa - comentado por ahora */}
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
