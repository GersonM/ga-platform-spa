import React from 'react';
import {Dropdown, Form, Input, Modal} from 'antd';

const {confirm} = Modal;
const items = [
  {label: 'Mover archivo', key: 'move', icon: <span className={'icon icon-move'} />},
  {label: 'Cambiar nombre', key: 'rename', icon: <span className={'icon icon-pencil-line'} />},
  {label: 'Actualizar', key: 'update', icon: <span className={'icon icon-repeat'} />},
  {type: 'divider'},
  {label: 'Borrar', key: 'delete', danger: true, icon: <span className={'icon icon-trash'} />},
];

interface FileDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
}

const FileDropdownActions = ({children, trigger}: FileDropdownActionsProps) => {
  const editName = () => {};

  const moveFile = () => {
    confirm({
      title: 'Elige el contenedor de destino',
      content: (
        <div>
          <Form layout={'vertical'} initialValues={{visibility: 'public'}}>
            <Form.Item
              name={'name'}
              label={'Nombre'}
              tooltip={
                'Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo'
              }>
              <Input placeholder={'Nombre'} />
            </Form.Item>
          </Form>
        </div>
      ),
      cancelText: 'Cancelar',
      icon: null,
      okText: 'Mover',
      onOk() {
        console.log('OK');
      },
    });
  };
  const confirmDelete = () => {
    confirm({
      title: '¿Seguro que quieres eliminar este archivo?',
      content: 'El archivo se enviará al contenedor de elementos borrados y podrás recuperarlos durante 7 días',
      cancelText: 'Cancelar',
      okText: 'Si, borrar',
      okType: 'danger',
      onOk() {
        console.log('OK');
      },
    });
  };

  const onClick = (option: any) => {
    console.log(option);
    switch (option.key) {
      case 'delete':
        confirmDelete();
        break;
      case 'move':
        moveFile();
        break;
    }
  };

  return (
    <Dropdown menu={{items, onClick}} arrow trigger={trigger}>
      {children}
    </Dropdown>
  );
};

export default FileDropdownActions;
