import React, {useEffect, useState} from 'react';
import {Form, Input, Pagination, Space, Tooltip} from "antd";
import axios from "axios";
import dayjs from "dayjs";

import type {
  ExternalResource,
  ResponsePagination,
  StorageProduct,
} from "../../../Types/api.tsx";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductGroupsSelector from "../../../WarehouseManager/Components/ProductGroupsSelector";
import ProductManufacturerSelector from "../../../WarehouseManager/Components/ProductManufacturerSelector";
import TableList from "../../../CommonUI/TableList";
import CustomTag from "../../../CommonUI/CustomTag";
import CsfFirewall from "../../Components/CsfFirewall";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil} from "react-icons/tb";
import ModalView from "../../../CommonUI/ModalView";
import ExternalResourceForm from "../../Components/ExternalResourceForm";

const MonitorServicesManager = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ExternalResource[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddResource, setOpenAddResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ExternalResource>();
  const [filters, setFilters] = useState<any>()

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

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      render: (text: string) => (<CustomTag color={'green'}>{text}</CustomTag>)
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
      dataIndex: 'auth_key',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Fecha de regisrto',
      width: 210,
      dataIndex: 'created_at',
      render: (date: any) => {
        return (
          <>
            {dayjs(date).fromNow()} <br/>
            <small>{dayjs(date).format('DD [de] MMMM [del] YYYY hh:mm a')}</small>
          </>
        );
      },
    },
    {
      dataIndex: 'uuid',
      render: (_uuid: string, row: ExternalResource) => (
        <Space>
          <IconButton icon={<TbPencil/>} onClick={() => setSelectedResource(row)}/>
        </Space>
      )
    }
  ]

  return (
    <ModuleContent>
      <ContentHeader
        title={'Monitoreo de servicios'}
        loading={loading}
        largeTools
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenAddResource(true)}>
        <FilterForm
          onInitialValues={values => setFilters(values)}
          onSubmit={values => setFilters(values)}
        >
          <Form.Item name={'search'} label={'Buscar'}>
            <Input.Search
              allowClear
              placeholder={'Buscar por nombre, código o descripción'}
            />
          </Form.Item>
          <Form.Item name={'ip'} label={'IP'}>
            <ProductGroupsSelector/>
          </Form.Item>
          <Form.Item name={'manufacturer'}>
            <ProductManufacturerSelector/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <TableList customStyle={false} columns={columns} dataSource={resources}/>
      {pagination && (
        <Pagination
          showSizeChanger={false}
          style={{marginTop: 10}}
          onChange={(page) => {
            setCurrentPage(page);
          }}
          size={"small"} total={pagination.total}
          showTotal={(total) => `${total} productos en total`}
          pageSize={pagination.per_page}
          current={pagination.current_page}/>
      )}
      <ModalView
        title={selectedResource ? 'Editar recurso':'Nuevo recurso'}
        open={openAddResource} onCancel={() => setOpenAddResource(false)}>
        <ExternalResourceForm externalResource={selectedResource} onComplete={() => setOpenAddResource(false)}/>
      </ModalView>
      {selectedResource &&
        <CsfFirewall resourceUuid={selectedResource?.uuid}/>
      }
    </ModuleContent>
  );
};

export default MonitorServicesManager;
