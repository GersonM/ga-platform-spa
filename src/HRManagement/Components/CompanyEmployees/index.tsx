import {useEffect, useState} from 'react';
import {Input, Pagination, Popconfirm, Space, Tooltip, message, Tag} from 'antd';
import axios from 'axios';
import {TbPlus, TbReload, TbUserCancel} from 'react-icons/tb';
import type {ColumnsType} from "antd/es/table";
import {TrashIcon} from "@heroicons/react/16/solid";
import dayjs from "dayjs";

import IconButton from '../../../CommonUI/IconButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from "../../../CommonUI/TableList";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import CreateEmployeeModal from '../CreateEmployeeModal'; // Importar el nuevo modal
import type {Employee, Profile} from "../../../Types/api.tsx";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

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
        if (response) {
          setEmployees(response.data.data);
          setPagination(response.data.meta);
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

  const handleEmployeeCreated = () => {
    setReload(!reload);
    setShowAddModal(false);
  };

  const columns: ColumnsType<Employee> = [
    {
      title: 'Empleado',
      dataIndex: 'profile',
      render: (profile: Profile) => {
        return <ProfileChip profile={profile}/>;
      },
    },
    {
      title: 'Cargo',
      dataIndex: 'position',
      render: (position) => <span style={{fontSize: '12px'}}>{position || '-'}</span>,
    },
    {
      title: 'Departamento',
      dataIndex: 'working_department',
      render: (department) => <span style={{fontSize: '12px'}}>{department || '-'}</span>,
    },
    {
      title: 'F. Ingreso',
      dataIndex: 'created_at',
      render: (created_at: string) => created_at ? dayjs(created_at).fromNow() : 'No',
      sorter: (a, b) => {
        //@ts-ignore
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      },
    },
    {
      title: 'F. Terminación',
      dataIndex: 'termination_date',
      render: (termination_date: string) => termination_date ? dayjs(termination_date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Estado',
      dataIndex: 'termination_date',
      width: 120,
      render: (termination_date: string) => {
        return (
          <Tag color={!termination_date ? 'green' : 'red'} bordered={false}>
            {!termination_date ? 'Activo' : 'Terminado'}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      width: 80,
      render: (_uuid: string, record) => (
        <Space>
          {!record.termination_date && (
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
                  icon={<TbUserCancel style={{fontSize: '22px'}}/>}
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
                icon={<TrashIcon className="h-3 w-3"/>}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space>
        <Input.Search
          allowClear
          placeholder={'Buscar por código, cargo, nombre o email...'}
          onSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          style={{maxWidth: 450}}
        />
        <PrimaryButton icon={<TbPlus />} label={'Nuevo empleado'} onClick={handleAddEmployee}/>
        <IconButton icon={<TbReload/>} onClick={() => setReload(!reload)}/>
      </Space>
      <p>{pagination?.total || 0} empleados encontrados</p>

      <TableList
        columns={columns}
        dataSource={employees}
        loading={loading}
      />
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
      <CreateEmployeeModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleEmployeeCreated}
        companyUuid={companyUuid}
      />
    </>
  );
};

export default CompanyEmployees;
