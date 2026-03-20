import React, {Fragment} from 'react';
import {TbChevronCompactRight} from "react-icons/tb";
import './styles.less';
import {
  PiCheckCircleDuotone,
  PiClockDuotone,
  PiWarningCircleDuotone
} from "react-icons/pi";

interface StepNavigationProps {
  items: any[];
  style?: React.CSSProperties;
  current?: number;
}

const StepsNavigation = ({items, current, style}: StepNavigationProps) => {
  return (
    <div className={'step-navigation-container'} style={style}>
      {items.map((item: any, index: number) => {
        return <Fragment key={index}>
          <div className={`step-navigation-item ${item.status} ${current === index ? 'active' : ''}`}>
            <div className="icon">
              {item.status ? <>
                {item.status === 'finish' && <PiCheckCircleDuotone/>}
                {item.status === 'wait' && <PiClockDuotone />}
                {item.status === 'pending' && <PiClockDuotone />}
                {item.status === 'error' && <PiWarningCircleDuotone />}
                </> :
                index + 1
              }
            </div>
            <div className={'content'}>
              {item.label}
              <div className={'description'}>{item.description}</div>
            </div>
            {index < (items.length - 1) && <div><TbChevronCompactRight size={28} style={{opacity:0.5}}/></div>}
          </div>
        </Fragment>
      })}
    </div>
  );
};

export default StepsNavigation;
