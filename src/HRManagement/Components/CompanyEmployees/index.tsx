import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Space, Tooltip, message, Spin, Tag, Row, Col} from 'antd';
import axios from 'axios';
import {TbPencil, TbTrash, TbSearch, TbUsersGroup, TbUserCancel} from 'react-icons/tb';

import ModuleContent from '../../../CommonUI/ModuleContent';
import IconButton from '../../../CommonUI/IconButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import FilterForm from '../../../CommonUI/FilterForm';
import TableList from "../../../CommonUI/TableList";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {ColumnsType} from "antd/es/table";
import {UserIcon} from "@heroicons/react/24/solid";
import {TrashIcon} from "@heroicons/react/16/solid";



interface Employee {
  uuid: string;
  fk_company_uuid: string;
  fk_profile_uuid: string;
  employee_code: string;
  position: string;
  fk_group_uuid?: string;
  cost_center?: string;
  monthly_salary: number;
  joining_date: string;
  termination_date?: string;
  work_regime: string;
  bank_account?: string;
  bank_name?: string;
  pension_system?: string;
  cuspp?: string;
  children_number: number;
  has_family_bonus: boolean;
  working_place?: string;
  working_department?: string;
  created_at: string;
  updated_at: string;


  // campos relacionados del perfil
  profile?: {
    name: string;
    last_name: string;
    email: string;
    phone?: string;
    document_number: string;
  };
}

interface CompanyEmployeesProps {
  companyUuid: string;
}

const CompanyEmployees = ({companyUuid}: CompanyEmployeesProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState<string>();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, page_size: pageSize, search},
    };

    setLoading(true);
    axios
      .get(`hr-management/companies/${companyUuid}/employees`, config)
      .then(response => {
        setLoading(false);
        if (response && response.data) {
          const paginatedData = response.data;
          if (paginatedData.data && Array.isArray(paginatedData.data)) {
            setEmployees(paginatedData.data);
            setPagination({
              total: paginatedData.total,
              page_size: paginatedData.per_page,
              current_page: paginatedData.current_page,
            });
          } else {
            setEmployees([]);
          }
        }
      })
      .catch(e => {
        setLoading(false);
        setEmployees([]);
        if (!axios.isCancel(e)) {
          ErrorHandler.showNotification(e);
        }
      });

    return cancelTokenSource.cancel;
  }, [companyUuid, reload, currentPage, pageSize, search]);

  const removeEmployee = (employeeUuid: string) => {
    setLoading(true);
    axios
      .delete(`hr-management/companies/${companyUuid}/employees/${employeeUuid}`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
          message.success('Empleado eliminado correctamente');
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const terminateEmployee = (employeeUuid: string) => {
    setLoading(true);
    axios
      .patch(`hr-management/companies/${companyUuid}/employees/${employeeUuid}/terminate`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
          message.success('Empleado terminado correctamente');
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const isEmployeeActive = (employee: Employee) => {
    return !employee.termination_date;
  };

  const departments = [...new Set(employees.map(emp => emp.working_department).filter(Boolean))];

  const columns: ColumnsType<Employee> = [
    {
      title: 'Empleado',
      key: 'employee',
      width: 120,
      render: (_, record) => (
        <div className="employee-info flex items-center space-x-1" style={{ minHeight: '20px' }}>
          <div className="employee-avatar flex-shrink-0" style={{ marginLeft: '10px'}}>
            <div className="avatar-circle rounded-full bg-blue-100 flex items-center justify-center" style={{ width: '20px', height: '20px', padding: '20px' }}>
              <UserIcon className="user-icon text-blue-600" style={{ width: '44px', height: '44px' }} />
            </div>
          </div>
          <div className="employee-details min-w-0 flex-1">
            <div className="employee-name text-gray-900 truncate" style={{ fontSize: '12px', lineHeight: '14px', padding: '20px' }}>
              {record.profile?.name} {record.profile?.last_name}
            </div>
            <div className="employee-meta truncate" style={{ fontSize: '10px', lineHeight: '12px' }}>
              {record.employee_code} • {record.profile?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (position) => <span style={{ fontSize: '12px' }}>{position || '-'}</span>,
    },
    {
      title: 'Departamento',
      dataIndex: 'working_department',
      key: 'working_department',
      width: 120,
      render: (department) => <span style={{ fontSize: '12px' }}>{department || '-'}</span>,
    },
    {
      title: 'F. Ingreso',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => <span style={{ fontSize: '12px' }}>{formatDate(date)}</span>,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Estado',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isActive = isEmployeeActive(record);
        return (
          <Tag color={isActive ? 'green' : 'red'} style={{ fontSize: '10px', padding: '2px 6px', margin: 0 }}>
            {isActive ? 'Activo' : 'Terminado'}
          </Tag>
        );
      },
    },
    {
      title: 'F. Terminación',
      dataIndex: 'termination_date',
      key: 'termination_date',
      width: 120,
      render: (date) => <span style={{ fontSize: '12px' }}>{date ? formatDate(date) : '-'}</span>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          {isEmployeeActive(record) && (
            <Tooltip title="Terminar empleado">
              <Popconfirm
                title="Terminar empleado"
                description="¿Estás seguro de que deseas terminar a este empleado?"
                okText="Terminar"
                cancelText="Cancelar"
                onConfirm={() => terminateEmployee(record.uuid)}
              >
                <IconButton
                  small
                  icon={<TbUserCancel style={{ fontSize: '12px' }} />}
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title="Eliminar empleado">
            <Popconfirm
              title="Eliminar empleado"
              description="¿Estás seguro de que deseas eliminar este empleado permanentemente?"
              okText="Eliminar"
              cancelText="Cancelar"
              onConfirm={() => removeEmployee(record.uuid)}
            >
              <IconButton
                small
                danger
                icon={<TrashIcon className="h-3 w-3" />}
              />
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
          title={'Empleados'}
          tools={`${pagination?.total || 0} empleados encontrados`}
          onAdd={handleAddEmployee}
          description={'Gestión de empleados de la empresa'}
        />

        <div className="mb-4">
          <Input.Search
            allowClear
            placeholder={'Buscar por código, cargo, nombre o email...'}
            onSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: 450 }}
          />
        </div>

        <div className="compact-table">
          <TableList
            columns={columns}
            dataSource={employees}
            loading={loading}
            pagination={false}
            rowKey="uuid"
            scroll={{ x: 1000 }}
            size="small"
          />
        </div>

        <Pagination
          style={{marginTop: 10}}
          align={'center'}
          total={pagination?.total}
          pageSize={pagination?.page_size}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}

        />


      </ModuleContent>

      <Modal
        title="Agregar Nuevo Empleado"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Aquí se implementará el formulario para agregar un nuevo empleado
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Empresa: {companyUuid}
          </p>
        </div>
      </Modal>
    </>
  );
};
export default CompanyEmployees;
