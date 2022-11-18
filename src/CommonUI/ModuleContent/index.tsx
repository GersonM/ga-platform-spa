import React from 'react';
import './styles.less';

interface ModuleContentProps {
  children?: React.ReactNode;
}
const ModuleContent = ({children}: ModuleContentProps) => {
  return <div className={'module-content-wrapper'}>{children}</div>;
};

export default ModuleContent;
