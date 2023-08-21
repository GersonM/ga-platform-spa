import React from 'react';
import './styles.less';

interface ModuleContentProps {
  children?: React.ReactNode;
  opaque?: boolean;
}
const ModuleContent = ({children, opaque}: ModuleContentProps) => {
  return <div className={'module-content-wrapper' + (opaque ? ' opaque' : '')}>{children}</div>;
};

export default ModuleContent;
