import React from 'react';
import {Tooltip} from "antd";
import {
  TbArrowLeftDashed,
  TbArrowRightDashed,
  TbShoppingCartPause,
  TbToiletPaper
} from "react-icons/tb";

interface StockActivityActionChipProps {
  action: string;
}

const actionsLabel: any = {
  reserve: 'Reserva',
  entrance: 'Ingreso',
  outlet: 'Venta',
  waste: 'Perdida',
  release_reservation: 'Liberación de reserva',
};
const actionsArrow: any = {
  reserve: 'stop',
  entrance: 'in',
  outlet: 'out',
  waste: 'waste',
  release_reservation: 'in',
};

const StockActivityActionChip = ({action}: StockActivityActionChipProps) => {
  return (
    <div>
      <Tooltip title={action}>
        {actionsArrow[action] == 'in' && <TbArrowRightDashed size={28} color={'green'}/>}
        {actionsArrow[action] == 'out' && <TbArrowLeftDashed size={28} color={'red'}/>}
        {actionsArrow[action] == 'stop' && <TbShoppingCartPause size={28} color={'orange'}/>}
        {actionsArrow[action] == 'waste' && <TbToiletPaper size={28} color={'orange'}/>}
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
