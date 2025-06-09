import {Tag} from 'antd';
import dayjs from 'dayjs';

import './styles.less';
import type {MailFolderPageContent, MailMessage} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';

interface ListMailMessagesProps {
  messages: MailFolderPageContent;
  onMessageSelected?: (msg: MailMessage) => void;
}

const ListMailMessages = ({messages, onMessageSelected}: ListMailMessagesProps) => {
  const columns = [
    {
      title: 'De',
      dataIndex: 'from',
      width: 250,
      render: (from: any) => (
        <>
          {from[0].personal} <br />
          <small>{from[0].mail}</small>
        </>
      ),
    },
    {
      title: 'Asunto',
      dataIndex: 'subject',
      render: (subject: string, row: MailMessage) => (
        <>
          {!row.is_read && <Tag color={'#f86110'}>Nuevo</Tag>} {subject} <br />
          <small className={'excerpt'}>{row.excerpt.substring(0, 120)}</small>
        </>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'delivery_date',
      render: (delivery_date: string) => {
        if (dayjs(delivery_date).isBefore(dayjs().subtract(1, 'day'))) {
          return dayjs(delivery_date).format('DD/MM/YYYY');
        } else {
          return dayjs(delivery_date).fromNow();
        }
      },
    },
  ];

  return (
    <>
      <TableList
        onClick={(row: MailMessage) => {
          //navigate(`/inbox-management/${params.account}/${params.uuid}/${row.message_id}`);
          onMessageSelected && onMessageSelected(row);
        }}
        rowKey={'message_id'}
        columns={columns}
        dataSource={messages.messages}
      />
    </>
  );
};

export default ListMailMessages;
