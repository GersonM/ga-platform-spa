import type {EntityActivity} from '../../Types/api';
import {PiCalendarDots, PiCheckBold, PiInfo, PiWarningDiamond} from 'react-icons/pi';
import {Tooltip} from "antd";
import {TbCheck} from "react-icons/tb";

interface EntityActivityIconProps {
  type: string;
  size?: number;
  activity?: EntityActivity;
}

const EntityActivityIcon = ({type, size = 18, activity}: EntityActivityIconProps) => {
  let color = undefined;

  if (type === 'alert' || activity?.type === 'alert') {
    color = 'red';
  }

  if (activity?.completed_at) {
    color = 'green';
    type = 'completed';
  }

  let icon = null;
  switch (type) {
    case 'completed':
      icon = <TbCheck size={size} color={color} />;
      break;
    case 'alert':
      icon = <PiWarningDiamond size={size} color={color} />;
      break;
    case 'schedule':
      icon = <PiCalendarDots size={size} color={color} />;
      break;
    case 'entry':
      icon = <PiInfo size={size} color={color} />;
      break;
    default:
      icon = <PiInfo size={size} color={color} />;
      break;
  }

  return <Tooltip title={type}>
    {icon}
  </Tooltip>
};

export default EntityActivityIcon;
