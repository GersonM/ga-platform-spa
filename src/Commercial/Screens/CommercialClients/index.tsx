import React, {useState} from 'react';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';

const CommercialClients = () => {
  const [clients, setClients] = useState();

  const columns = [
    {title: 'Nombre', dataIndex: 'contact_name'},
    {title: 'Correo', dataIndex: 'address'},
    {title: 'Restringido', dataIndex: 'is_disabled', render: (value: boolean) => (value ? 'Si' : 'No')},
    {
      title: 'Configurado',
      dataIndex: 'setup_completed',
      render: (value: boolean) => (value ? 'Si' : 'No'),
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Clientes'} />
      <TableList columns={columns} dataSource={clients} />
    </ModuleContent>
  );
};

export default CommercialClients;
