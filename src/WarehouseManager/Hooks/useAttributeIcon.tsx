import React from 'react';
import {TbBath, TbBed, TbCar, TbInfoCircle, TbLayersSelected, TbSquare} from "react-icons/tb";
import {PiRectangleDashedDuotone, PiRuler} from "react-icons/pi";

const useAttributeIcon = () => {
  const getIcon = (code: string) => {
    switch (code) {
      case 'dormitorio':
        return <TbBed/>;
      case 'banos':
        return <TbBath/>;
      case 'area-total':
      case 'area':
      case 'perimetro':
        return <TbSquare/>;
      case 'superficie':
        return <PiRectangleDashedDuotone/>;
      case 'cochera':
        return <TbCar/>;
      case 'lateral':
      case 'frente':
      case 'left':
      case 'right':
      case 'back':
      case 'fondo':
        return <PiRuler/>;
      case 'n-de-pisos':
        return <TbLayersSelected/>;
      default:
        return <TbInfoCircle/>;
    }
  }

  return {getIcon};
};

export default useAttributeIcon;
