import React from 'react';
import {Tag} from "antd";

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
  terminated: 'Terminado',
}

const colors: any = {
  provisioning: 'blue',
  cancelled: 'red',
  approved: 'green',
  proposal: 'orange',
  completed: 'cyan',
  provided: 'lime',
  terminated: 'default',
}

const ContractStatus = ({contract}: ContractStatusProps) => {
  //const date = contract.created_at || contract.approved_at || contract.date_start || contract.provided_at || contract.cancelled_at;
  return (
    <Tag variant={'outlined'} color={colors[contract.status]}>
      {statuses[contract.status]}
    </Tag>
  );
};

export default ContractStatus;
