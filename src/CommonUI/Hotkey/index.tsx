import React from 'react';
import {Tooltip} from 'antd';
import './styles.less';

interface HotkeyProps {
  shortKey: string;
  title?: string;
  showCtrl?: boolean;
}

const Hotkey = ({shortKey, title, showCtrl = true}: HotkeyProps) => {
  return (
    <Tooltip title={title}>
      <div className={'hotkey-container'}>
        {showCtrl && (
          <>
            <i className={'key-icon icon-ctrl_key'} />+
          </>
        )}{' '}
        {shortKey}
      </div>
    </Tooltip>
  );
};

export default Hotkey;
