import React, {Fragment} from 'react';
import {TbAlertCircle, TbCheck, TbChevronCompactRight, TbClock} from "react-icons/tb";
import './styles.less';

interface StepNavigationProps {
  items: any[];
  style?: React.CSSProperties;
  current?: number;
}

const StepNavigation = ({items, current, style}: StepNavigationProps) => {
  return (
    <div className={'step-navigation-container'} style={style}>
      {items.map((item: any, index: number) => {
        return <Fragment key={index}>
          <div className={`step-navigation-item ${item.status} ${current === index ? 'active' : ''}`}>
            <div className="icon">
              {item.status ? <>
                {item.status === 'finish' && <TbCheck size={20}/>}
                {item.status === 'wait' && <TbClock size={20}/>}
                {item.status === 'pending' && <TbClock size={20}/>}
                {item.status === 'error' && <TbAlertCircle size={20} />}
                </> :
                index + 1
              }
            </div>
            <div className={'content'}>
              {item.title}
              <div className={'description'}>{item.description}</div>
            </div>
            {index < (items.length - 1) && <div><TbChevronCompactRight size={28} style={{opacity:0.5}}/></div>}
          </div>
        </Fragment>
      })}
    </div>
  );
};

export default StepNavigation;
