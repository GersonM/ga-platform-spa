import {type ReactNode, useEffect} from 'react';
import {Space, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import {PiPencilSimple} from 'react-icons/pi';

import IconButton from '../IconButton';
import {
  TbArrowLeft,
  TbPlus,
  TbRefresh
} from "react-icons/tb";

interface ContentHeaderProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  backLocation?: string;
  tools?: ReactNode;
  children?: ReactNode;
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
          if (onRefresh) {
            onRefresh();
          }
        }
        if (e.key.toLowerCase() === 'n') {
          if (onAdd) {
            onAdd();
          }
        }
        if (e.key.toLowerCase() === 'e') {
          if (onEdit) {
            onEdit();
          }
        }
      }
      if (e.key.toLowerCase() === 'Escape') {
        if (onBack) {
          onBack();
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
                  if (onBack) onBack()
                  else navigate(-1);
                }
              }}
              icon={<TbArrowLeft/>}
            />
          </Tooltip>
        )}
        <div>
          <h1>{title}</h1>
        </div>
        {onAdd && (
          <Tooltip title={'Nuevo'}>
            <IconButton icon={<TbPlus />} onClick={onAdd}/>
          </Tooltip>
        )}
        {onRefresh && (
          <Tooltip title={'Actualizar'}>
            <IconButton icon={<TbRefresh className={loading ? 'spin' : ''}/>} onClick={onRefresh}/>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title={'Editar'}>
            <IconButton icon={<PiPencilSimple />} onClick={onEdit}/>
          </Tooltip>
        )}
        {tools}
      </Space>
      {description && <div style={{marginTop: 10, fontSize: 12}}>{description}</div>}
      {children && <div className={'content-header-caption'}>{children}</div>}
    </div>
  );
};

export default ContentHeader;
