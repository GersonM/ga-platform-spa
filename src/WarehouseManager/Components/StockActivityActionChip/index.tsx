import React from 'react';
import {Tooltip} from "antd";
import {TbArrowLeftDashed, TbShoppingCartPause,} from "react-icons/tb";
import {PiPackageDuotone, PiToiletPaperDuotone} from "react-icons/pi";
import {LuPackageOpen} from "react-icons/lu";

interface StockActivityActionChipProps {
  action: string;
}

const actionsLabel: any = {
  reserve: 'Reserva',
  entrance: 'Ingreso',
  outlet: 'Venta',
  waste: 'Perdida',
  release_reservation: 'Liberación de reserva',
  retire_from_sale: 'Archivar',
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
        {actionsArrow[action] == 'in' && <LuPackageOpen size={28} color={'green'}/>}
        {actionsArrow[action] == 'out' && <TbArrowLeftDashed size={28} color={'red'}/>}
        {actionsArrow[action] == 'stop' && <TbShoppingCartPause size={28} color={'orange'}/>}
        {actionsArrow[action] == 'waste' && <PiToiletPaperDuotone size={28} color={'red'}/>}
        {action == 'retire_from_sale' && <PiPackageDuotone size={28} color={'orange'}/>}
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
