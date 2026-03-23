import React from 'react';
import {Tag} from "antd";

import type {Contract} from "../../../Types/api.tsx";

interface ContractStatusProps {
  contract: Contract;
  showTrackingId?: boolean;
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

const ContractStatus = ({contract, showTrackingId = false}: ContractStatusProps) => {
  return (
    <Tag variant={'outlined'} color={colors[contract.status]}>
      {showTrackingId && <code>{contract.tracking_id}: </code>}
      {statuses[contract.status]}
    </Tag>
  );
};

export default ContractStatus;
