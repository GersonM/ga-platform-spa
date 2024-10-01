import React from 'react';
import {AiOutlineAlert} from 'react-icons/ai';
import {CalendarDaysIcon, ChatBubbleLeftIcon} from '@heroicons/react/24/outline';

interface EntityActivityIconProps {
  type: string;
  size?: number;
}

const EntityActivityIcon = ({type, size = 18}: EntityActivityIconProps) => {
  switch (type) {
    case 'alert':
      return <AiOutlineAlert size={size} color={'#ff0000'} />;
    case 'schedule':
      return <CalendarDaysIcon width={size} />;
    case 'entry':
      return <ChatBubbleLeftIcon width={size} />;
    default:
      return <CalendarDaysIcon width={size} />;
  }
};

export default EntityActivityIcon;
