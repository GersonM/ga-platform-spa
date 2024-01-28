import React from 'react';
import {Tooltip} from 'antd';
import './styles.less';

interface HotkeyProps {
  shortKey: string;
  title?: string;
}

const Hotkey = ({shortKey, title}: HotkeyProps) => {
  return (
    <Tooltip title={title}>
      <div className={'hotkey-container'}>
        <i className={'key-icon icon-ctrl_key'} /> + {shortKey}
      </div>
    </Tooltip>
  );
};

export default Hotkey;
