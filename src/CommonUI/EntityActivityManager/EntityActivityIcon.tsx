import type {EntityActivity} from '../../Types/api';
import {PiCalendarDots, PiInfo, PiWarningDiamond} from 'react-icons/pi';
import {Tooltip} from "antd";

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
  }

  let icon = null;
  switch (type) {
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
