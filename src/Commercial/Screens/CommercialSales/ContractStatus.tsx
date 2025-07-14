import React from 'react';
import dayjs from "dayjs";
import {Tag} from "antd";
import type {Contract} from "../../../Types/api.tsx";

interface ContractStatusProps {
  contract: Contract;
  showDate?: boolean;
}

const statuses: any = {
  provisioning: 'En proceso',
  cancelled: 'Cancelado',
  approved: 'Cancelado',
  proposal: 'Propuesta',
  completed: 'Entregado',
}

const colors: any = {
  provisioning: 'orange',
  cancelled: 'red',
  approved: 'blue',
  proposal: 'yellow',
  completed: 'green',
}

const ContractStatus = ({contract, showDate = true}: ContractStatusProps) => {
  const date = contract.created_at || contract.approved_at || contract.date_start || contract.provided_at || contract.cancelled_at;
  return (
    <div>
      <Tag style={{marginRight:0}} bordered={false} color={colors[contract.status]}>{statuses[contract.status]}</Tag>
      {showDate && <small>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</small>}
    </div>
  );
};

export default ContractStatus;
