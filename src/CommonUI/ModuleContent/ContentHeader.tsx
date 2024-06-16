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
  bordered = false,
}: ContentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={`content-header ${bordered ? 'bordered' : ''}`}>
      <Space>
        {(onBack || backLocation) && (
          <Tooltip title={'Back'}>
            <IconButton
              onClick={() => {
                onBack && onBack();
                backLocation && navigate(backLocation);
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
              <Tooltip title={'Create new'}>
                <IconButton icon={<PlusIcon />} onClick={onAdd} />
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title={'Reload content'}>
                <IconButton icon={<ArrowPathIcon className={loading ? 'spin' : ''} />} onClick={onRefresh} />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={'Edit'}>
                <IconButton icon={<PencilIcon />} onClick={onEdit} />
              </Tooltip>
            )}
            {tools}
          </>
        )}
      </Space>
      <br />
      {children}
    </div>
  );
};

export default ContentHeader;
