import React, {useEffect} from 'react';
import {Space, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import {PlusIcon, ArrowPathIcon, ArrowUturnLeftIcon} from '@heroicons/react/24/solid';
import {PiPencilSimple} from 'react-icons/pi';

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
  showBack?: boolean;
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

  useEffect(() => {
    const shortcutHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === 'r') {
          onRefresh && onRefresh();
        }
        if (e.key.toLowerCase() === 'n') {
          onAdd && onAdd();
        }
        if (e.key.toLowerCase() === 'e') {
          onEdit && onEdit();
        }
        if (e.key.toLowerCase() === 'Escape') {
          onBack && onBack();
        }
      }
    };
    document.addEventListener('keypress', shortcutHandler);

    return () => {
      document.removeEventListener('keypress', shortcutHandler);
    };
  }, []);

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
        </div>
        {(tools || onAdd || onRefresh || onEdit) && (
          <>
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
                <IconButton icon={<PiPencilSimple size={18} />} onClick={onEdit} />
              </Tooltip>
            )}
            {tools}
          </>
        )}
      </Space>
      {description && <div style={{marginTop: 10, fontSize: 12}}>{description}</div>}
      {children && <div className={'content-header-caption'}>{children}</div>}
    </div>
  );
};

export default ContentHeader;
