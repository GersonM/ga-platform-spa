import React from 'react';
import {Modal} from "antd";

interface ModalViewProps {
  title?: string|React.ReactNode;
  open: boolean;
  width?: number|string;
  onCancel: () => void;
  children: React.ReactNode;
}

const ModalView = ({title, children, ...props}:ModalViewProps) => {
  return (
    <Modal
      destroyOnHidden
      footer={null}
      {...props}
      title={title}>
      {children}
    </Modal>
  );
};

export default ModalView;
