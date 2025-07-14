import type {EntityActivity} from '../../Types/api';
import {PiCalendarDots, PiInfo, PiWarningDiamond} from 'react-icons/pi';

interface EntityActivityIconProps {
  type: string;
  size?: number;
  activity?: EntityActivity;
}

const EntityActivityIcon = ({type, size = 18, activity}: EntityActivityIconProps) => {
  let color = undefined;

  if (type === 'alert' || activity?.type === 'alert') {
    color = '#ff0000';
  }

  if (activity?.completed_at) {
    color = '#1dc600';
  }

  switch (type) {
    case 'alert':
      return <PiWarningDiamond size={size} color={color} />;
    case 'schedule':
      return <PiCalendarDots size={size} color={color} />;
    case 'entry':
      return <PiInfo size={size} color={color} />;
    default:
      return <PiCalendarDots size={size} color={color} />;
  }
};

export default EntityActivityIcon;
