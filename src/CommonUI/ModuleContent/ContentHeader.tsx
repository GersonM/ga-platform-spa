import React from 'react';
import {Divider, Space, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import {PlusIcon, ArrowPathIcon, ArrowUturnLeftIcon, PencilIcon} from '@heroicons/react/24/solid';

import IconButton from '../IconButton';

interface ContentHeaderProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  backLocation?: string;
  tools?: React.ReactNode;
  children?: React.ReactNode;
  onAdd?: () => void;
  onEdit?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  bordered?: boolean;
}

const ContentHeader = ({
  title,
  children,
  tools,
  backLocation,
  description,
  onRefresh,
  onEdit,
  onBack,
  onAdd,
  loading,
  showBack,
  bordered = false,
}: ContentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={`content-header ${bordered ? 'bordered' : ''}`}>
      <Space wrap>
        {(onBack || backLocation || showBack) && (
          <Tooltip title={'Back'}>
            <IconButton
              onClick={() => {
                if (backLocation) {
                  navigate(backLocation);
                } else {
                  onBack ? onBack() : navigate(-1);
                }
              }}
              icon={<ArrowUturnLeftIcon />}
            />
          </Tooltip>
        )}
        <div>
          <h1>{title}</h1>
          {description && <small>{description}</small>}
        </div>
        {(tools || onAdd || onRefresh || onEdit) && (
          <>
            <Divider type={'vertical'} />
            {onAdd && (
              <Tooltip title={'Nuevo'}>
                <IconButton icon={<PlusIcon />} onClick={onAdd} />
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title={'Actualizar'}>
                <IconButton icon={<ArrowPathIcon className={loading ? 'spin' : ''} />} onClick={onRefresh} />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={'Editar'}>
                <IconButton icon={<PencilIcon />} onClick={onEdit} />
              </Tooltip>
            )}
            {tools}
          </>
        )}
      </Space>
      {children && <div className={'content-header-caption'}>{children}</div>}
    </div>
  );
};

export default ContentHeader;
