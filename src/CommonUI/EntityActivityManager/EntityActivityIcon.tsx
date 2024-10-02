import React from 'react';
import {AiOutlineAlert} from 'react-icons/ai';
import {CalendarDaysIcon, ChatBubbleLeftIcon} from '@heroicons/react/24/outline';
import {EntityActivity} from '../../Types/api';

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
      return <AiOutlineAlert size={size} color={color} />;
    case 'schedule':
      return <CalendarDaysIcon width={size} color={color} />;
    case 'entry':
      return <ChatBubbleLeftIcon width={size} color={color} />;
    default:
      return <CalendarDaysIcon width={size} color={color} />;
  }
};

export default EntityActivityIcon;
