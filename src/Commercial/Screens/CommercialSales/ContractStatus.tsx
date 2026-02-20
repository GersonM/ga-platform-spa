import React from 'react';
import dayjs from "dayjs";
import {Tag, Tooltip} from "antd";

import type {Contract} from "../../../Types/api.tsx";

interface ContractStatusProps {
  contract: Contract;
}

const statuses: any = {
  provisioning: 'En proceso',
  cancelled: 'Anulado',
  approved: 'Aprobado',
  proposal: 'Propuesta',
  completed: 'Completado',
  provided: 'Entregado',
}

const colors: any = {
  provisioning: 'blue',
  cancelled: 'red',
  approved: 'green',
  proposal: 'orange',
  completed: 'cyan',
  provided: 'lime',
}

const ContractStatus = ({contract}: ContractStatusProps) => {
  const date = contract.created_at || contract.approved_at || contract.date_start || contract.provided_at || contract.cancelled_at;
  return (
    <Tag variant={'solid'} color={colors[contract.status]}>
      {statuses[contract.status]}
    </Tag>
  );
};

export default ContractStatus;
