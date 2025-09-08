import React from 'react';
import dayjs from "dayjs";
import {Tooltip} from "antd";

import type {Contract} from "../../../Types/api.tsx";
import CustomTag from "../../../CommonUI/CustomTag";

interface ContractStatusProps {
  contract: Contract;
}

const statuses: any = {
  provisioning: 'En proceso',
  cancelled: 'Anulado',
  approved: 'Aprobado',
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

const ContractStatus = ({contract}: ContractStatusProps) => {
  const date = contract.created_at || contract.approved_at || contract.date_start || contract.provided_at || contract.cancelled_at;
  return (
    <div>
      <Tooltip title={<code>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</code>}>
        <CustomTag color={colors[contract.status]}>{statuses[contract.status]}</CustomTag>
      </Tooltip>
    </div>
  );
};

export default ContractStatus;
