import React, {type ReactNode, useEffect} from 'react';
import {Space, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import {PiPencilSimple} from 'react-icons/pi';
import {TbArrowLeft, TbPlus, TbRefresh} from "react-icons/tb";

import IconButton from '../IconButton';
import PrimaryButton from "../PrimaryButton";

interface ContentHeaderProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  backLocation?: string;
  tools?: ReactNode;
  largeTools?: boolean;
  children?: ReactNode;
  onAdd?: () => void;
  onEdit?: () => void;
  onBack?: () => void;
  onRefresh?: () => void;
  showBack?: boolean;
  loading?: boolean;
  bordered?: boolean;
}

const ContentHeader = (
  {
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
    largeTools = false,
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
        <div className={'header-content-title'}>
          {React.isValidElement(title) ? title : (<h1 className={'title'}>{title}</h1>)}
        </div>
        {onAdd && (
          largeTools ?
            <PrimaryButton icon={<TbPlus/>} ghost size={'small'} shape={'round'} label={'Nuevo'} onClick={onAdd}/> :
            <IconButton title={'Nuevo'} icon={<TbPlus/>} onClick={onAdd}/>
        )}
        {onRefresh && (
          largeTools ?
            <PrimaryButton
              icon={<TbRefresh className={loading ? 'spin' : ''}/>}
              ghost
              disabled={loading}
              size={'small'} shape={'round'}
              label={'Recargar'} onClick={onRefresh}/> :
            <IconButton
              title={'Actualizar'}
              disabled={loading}
              icon={<TbRefresh className={loading ? 'spin' : ''}/>} onClick={onRefresh}/>
        )}
        {onEdit && (
          <Tooltip title={'Editar'}>
            <IconButton icon={<PiPencilSimple/>} onClick={onEdit}/>
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
