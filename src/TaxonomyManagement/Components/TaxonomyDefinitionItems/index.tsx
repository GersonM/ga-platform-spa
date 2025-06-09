import {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/24/solid';
import {Form, Modal, Popconfirm, Space} from 'antd';
import {Link} from 'react-router-dom';
import {TbPlus} from 'react-icons/tb';
import axios from 'axios';

import {TaxonomyDefinition, TaxonomyDefinitionItem} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import IconButton from '../../../CommonUI/IconButton';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContainerSelector from '../../../CommonUI/ContainerSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface TaxonomyDefinitionItemsProps {
  definition: TaxonomyDefinition;
}

const TaxonomyDefinitionItems = ({definition}: TaxonomyDefinitionItemsProps) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [openContainer, setOpenContainer] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`taxonomy/definitions/${definition.uuid}/items`, config)
      .then(response => {
        if (response) {
          setItems(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteRelation = (uuid: string) => {
    setLoading(true);
    axios
      .delete(`taxonomy/items/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const addRelation = (values: any) => {
    setLoading(true);
    axios
      .post(`taxonomy/items`, {...values, entity_type: 'container', taxonomy_uuid: definition.uuid})
      .then(() => {
        setLoading(false);
        setReload(!reload);
        setOpenContainer(false);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const columns = [
    {
      dataIndex: 'type',
      title: 'Tipo',
      width: 120,
      render: (type: string) => {
        return type.split('\\').reverse()[0];
      },
    },
    {
      dataIndex: 'type',
      title: 'Nombre',
      render: (type: string, row: TaxonomyDefinitionItem) => {
        switch (true) {
          case type.includes('Course'):
            return (
              <Link to={`/lms/courses/${row.entity.uuid}`} target={'_blank'}>
                {row.entity.name}
              </Link>
            );
          case type.includes('Container'):
            return (
              <Link to={`/file-management/${row.entity.uuid}`} target={'_blank'}>
                {row.entity.name}
              </Link>
            );
          case type.includes('File'):
            return row.entity.name;
        }
      },
    },
    {
      dataIndex: 'uuid',
      title: 'Acciones',
      render: (uuid: string) => {
        return (
          <Space>
            <Popconfirm title={'¿Quieres eliminar?'} onConfirm={() => deleteRelation(uuid)}>
              <IconButton danger icon={<TrashIcon />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <TableList loading={loading} columns={columns} dataSource={items} />
      <Modal
        destroyOnClose
        footer={false}
        open={openContainer}
        onCancel={() => setOpenContainer(false)}
        title={'Agregar nuevo contenedor'}>
        <Form layout={'vertical'} onFinish={addRelation}>
          <Form.Item label={'Seleccionar el contenedor que quieres agregar'} name={'entity_uuid'}>
            <ContainerSelector />
          </Form.Item>
          <PrimaryButton label={'Agregar'} htmlType={'submit'} block loading={loading} />
        </Form>
      </Modal>
      <PrimaryButton
        label={'Agregar nuevo contenedor'}
        icon={<TbPlus size={18} />}
        block
        onClick={() => setOpenContainer(true)}
      />
    </>
  );
};
export default TaxonomyDefinitionItems;
