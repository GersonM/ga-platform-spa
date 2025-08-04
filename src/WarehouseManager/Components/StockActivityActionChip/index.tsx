import React from 'react';
import {Tooltip} from "antd";
import {TbArrowLeftDashed, TbArrowRightDashed, TbShoppingCartCancel, TbShoppingCartPause} from "react-icons/tb";

interface StockActivityActionChipProps {
  action: string;
}

const actionsLabel: any = {
  reserve: 'Reserva',
  entrance: 'Ingreso',
  outlet: 'Venta',
  release_reservation: 'Liberación de reserva',
};
const actionsArrow: any = {
  reserve: 'stop',
  entrance: 'in',
  outlet: 'out',
  release_reservation: 'in',
};

const StockActivityActionChip = ({action}: StockActivityActionChipProps) => {
  return (
    <div>
      <Tooltip title={action}>
        {actionsArrow[action] == 'in' && <TbArrowRightDashed size={22} color={'green'}/>}
        {actionsArrow[action] == 'out' && <TbArrowLeftDashed size={22} color={'red'}/>}
        {actionsArrow[action] == 'stop' && <TbShoppingCartPause size={22} color={'orange'}/>}
        <code>
          <small>
            {actionsLabel[action]}
          </small>
        </code>
      </Tooltip>
    </div>
  );
};

export default StockActivityActionChip;
