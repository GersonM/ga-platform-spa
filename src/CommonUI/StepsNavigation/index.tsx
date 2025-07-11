import React, {Fragment} from 'react';
import './styles.less';
import {TbAlertCircle, TbCheck, TbChevronCompactRight, TbClock} from "react-icons/tb";

interface StepNavigationProps {
  items: any[];
  style?: React.CSSProperties;
  current?: number;
}

const StepNavigation = ({items, current, style}: StepNavigationProps) => {
  return (
    <div className={'step-navigation-container'}>
      {items.map((item: any, index: number) => {
        return <Fragment key={index}>
          <div className={`step-navigation-item ${item.status}`}>
            <div className="icon">
              {item.status ? <>
                {item.status === 'finish' && <TbCheck size={20}/>}
                {item.status === 'wait' && <TbClock size={20}/>}
                {item.status === 'error' && <TbAlertCircle size={20} />}
                </> :
                index + 1
              }
            </div>
            <div className={'content'}>
              {item.title}
              <div>{item.description}</div>
            </div>
            {index < (items.length - 1) && <div style={{marginRight: 10}}><TbChevronCompactRight size={20}/></div>}
          </div>
        </Fragment>
      })}
    </div>
  );
};

export default StepNavigation;
