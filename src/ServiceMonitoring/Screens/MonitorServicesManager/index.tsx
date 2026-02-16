import React, {useEffect, useState} from 'react';
import {Form, Input, notification, Popconfirm, Select, Space, Tooltip} from "antd";
import {TbBrandMysql, TbKey, TbPencil} from "react-icons/tb";
import {PiDatabaseDuotone, PiHardDrivesDuotone} from "react-icons/pi";
import {LuEye, LuPower, LuScan, LuScanLine, LuServer, LuTrash2} from "react-icons/lu";
import {useNavigate} from "react-router-dom";
import axios from "axios";

import type {
  ExternalResource,
  ResponsePagination,
} from "../../../Types/api.tsx";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductGroupsSelector from "../../../WarehouseManager/Components/ProductGroupsSelector";
import ProductManufacturerSelector from "../../../WarehouseManager/Components/ProductManufacturerSelector";
import TableList from "../../../CommonUI/TableList";
import CustomTag from "../../../CommonUI/CustomTag";
import IconButton from "../../../CommonUI/IconButton";
import ModalView from "../../../CommonUI/ModalView";
import ExternalResourceForm from "../../Components/ExternalResourceForm";
import TablePagination from "../../../CommonUI/TablePagination";
import ResourceStatus from "../../Components/ResourceStatus";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import {GrMysql} from "react-icons/gr";

const MonitorServicesManager = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ExternalResource[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddResource, setOpenAddResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ExternalResource>();
  const [filters, setFilters] = useState<any>();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, with_stock: 1, ...filters},
    };

    setLoading(true);

    axios
      .get(`external-resources`, config)
      .then(response => {
        if (response) {
          setResources(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage, filters]);

  const resetServer = (uuid: string) => {
    setLoading(true);
    axios.post(`external-resources/servers/${uuid}/reset`)
      .then(() => {
        setLoading(false);
        api.info({message: 'Reinicio en proceso'});
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  const scanResource = (uuid: string) => {
    setLoading(true);
    api.info({message: 'Escaneado en proceso'});
    axios.post(`external-resources/${uuid}/scan`)
      .then((response) => {
        setLoading(false);
        api.success({message: 'Finalizado', description:<ul>{response.data.map((s:string, index:number) => <li key={index}>{s}</li>)}</ul>});
        setReload(!reload);
      })
      .catch((error) => {
        api.error({message: 'No se pudo escanear'});
        setLoading(false);
        ErrorHandler.showNotification(error, 3, api);
      })
  }

  const showAuthKey = (uuid: string) => {
    setLoading(true);
    axios.get(`external-resources/${uuid}/auth-key`)
      .then((response) => {
        setLoading(false);
        api.info({message: 'Llave', 'description': response.data.key});
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  const deleteService = (uuid: string) => {
    setLoading(true);
    axios.delete(`external-resources/${uuid}`)
      .then(() => {
        setLoading(false);
        api.success({message: 'Servicio eliminado'});
        setReload(!reload);
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  const getTypeIcon = (type: string) => {
    const iconSize = 28
    switch (type) {
      case 'server':
      case 'vps':
      case 'smart7bus_api':
        return <PiHardDrivesDuotone size={iconSize}/>;
      case 'smart7bus_api_db':
        return <PiDatabaseDuotone size={iconSize}/>;
      case 'mysql_server':
        return <GrMysql size={iconSize}/>;
      case 'database_mysql':
        return <PiDatabaseDuotone size={iconSize}/>;
      default:
        return <LuServer/>;
    }
  }

  const columns = [
    {
      title: '',
      dataIndex: 'type',
      render: (type: string) => (getTypeIcon(type))
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 190,
      render: (name: string, record: ExternalResource) => (<>
        {name} <br/>
        <small>{record.description}</small>
      </>)
    },
    {
      title: 'Estado',
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string) => (<ResourceStatus resourceUuid={uuid}/>)
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      width: 100,
      render: (text: string) => (<CustomTag>{text}</CustomTag>)
    },
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Usuario',
      dataIndex: 'auth_user',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Llave',
      dataIndex: 'auth_key_hint',
      render: (text: string, record: ExternalResource) => (text ?
        <Tooltip title={text}><TbKey size={20} onClick={() => showAuthKey(record.uuid)}/></Tooltip> : null)
    },
    {
      title: 'Grupo',
      dataIndex: 'group'
    },
    {
      title: 'Tiempo activo',
      dataIndex: 'uptime'
    },
    {
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string, row: ExternalResource) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedResource(row);
            setOpenAddResource(true);
          }}/>
          <IconButton small icon={<LuEye/>} onClick={() => navigate(uuid)}/>
          <Popconfirm
            title={'¿Quieres escanear el servicio?'} description={'Buscará servicios soportados y los agregará'}
            onConfirm={() => scanResource(uuid)}
          >
            <IconButton small icon={<LuScanLine/>}/>
          </Popconfirm>
          <Popconfirm
            title={'¿Quieres reiniciar el servicio?'} description={'Forzar reinicio del sistema'}
            onConfirm={() => resetServer(uuid)}
          >
            <IconButton small danger icon={<LuPower/>} title={'Reiniciar'}/>
          </Popconfirm>
          <Popconfirm
            title={'¿Quieres reiniciar el servicio?'} description={'No elimina el servicio solo lo quita de la lista'}
            onConfirm={() => deleteService(uuid)}
          >
            <IconButton small danger icon={<LuTrash2/>}/>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <ModuleContent>
      {contextHolder}
      <ContentHeader
        title={'Servicio y recursos'}
        loading={loading}
        largeTools
        onRefresh={() => setReload(!reload)}
        onAdd={() => {
          setOpenAddResource(true);
          setSelectedResource(undefined);
        }}>
        <FilterForm
          onInitialValues={values => setFilters(values)}
          onSubmit={values => setFilters(values)}
        >
          <Form.Item name={'search'} label={'Buscar'}>
            <Input.Search
              allowClear
              placeholder={'Buscar por nombre, ID o descripción'}
            />
          </Form.Item>
          <Form.Item name={'type'} label={'Tipo'}>
            <Select allowClear placeholder={'Todos'} popupMatchSelectWidth={false} options={[
              {label: 'server', value: 'server'},
              {label: 'vps', value: 'vps'},
              {label: 'smart7bus_api', value: 'smart7bus_api'},
              {label: 'smart7bus_api_db', value: 'smart7bus_api_db'},
              {label: 'mysql_server', value: 'mysql_server'},
              {label: 'database_mysql', value: 'database_mysql'},
            ]}/>
          </Form.Item>
          <Form.Item name={'manufacturer'}>
            <ProductManufacturerSelector/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <TableList
        customStyle={false}
        columns={columns}
        dataSource={resources}
        expandable={{

          rowExpandable: (record) => record.children?.length,
        }}
      />
      {pagination && (
        <TablePagination pagination={pagination} onChange={(page) => setCurrentPage(page)}/>
      )}
      <ModalView
        title={selectedResource ? 'Editar recurso' : 'Nuevo recurso'}
        open={openAddResource} onCancel={() => setOpenAddResource(false)}>
        <ExternalResourceForm
          externalResource={selectedResource} onComplete={() => {
          setOpenAddResource(false);
          setReload(!reload);
        }}/>
      </ModalView>
    </ModuleContent>
  );
};

export default MonitorServicesManager;
