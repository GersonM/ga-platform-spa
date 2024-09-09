import React, {useEffect, useState} from 'react';
import {PlusIcon} from '@heroicons/react/24/solid';
import {TbPencil, TbTrash} from 'react-icons/tb';
import {Popconfirm} from 'antd';
import {ChevronUpIcon, ChevronDownIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import {TaxonomyDefinition} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import './styles.less';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface TaxonomyItemProps {
  taxonomy: TaxonomyDefinition;
  onEdit?: (t: TaxonomyDefinition) => void;
  onDelete?: (t: TaxonomyDefinition) => void;
  onAdd?: (t: TaxonomyDefinition) => void;
}

const TaxonomyItem = ({taxonomy, onEdit, onDelete, onAdd}: TaxonomyItemProps) => {
  const [open, setOpen] = useState(false);
  const [definitionDetails, setDefinitionDetails] = useState<TaxonomyDefinition>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`taxonomy/definitions/${taxonomy.uuid}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setDefinitionDetails(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [open]);

  return (
    <div className={'taxonomy-item-wrapper'}>
      <div className={'item-block'}>
        <div className={'cover'}>
          <img src={taxonomy.cover?.thumbnail} alt="" />
        </div>
        <div className={'content'}>
          {taxonomy.name} <br />
          <small>{taxonomy.description}</small>
        </div>
        <div className={'tools'}>
          <IconButton
            small
            icon={<TbPencil size={18} />}
            onClick={() => {
              onEdit && onEdit(taxonomy);
            }}
          />
          <Popconfirm
            title={'¿Seguro que quieres eliminar esta taxonomía?'}
            description={'Esto eliminar todas los elementos relacionados'}
            onConfirm={() => onDelete && onDelete(taxonomy)}>
            <IconButton small icon={<TbTrash size={18} />} danger />
          </Popconfirm>
          <IconButton
            small
            icon={open ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={() => {
              setOpen(!open);
            }}
          />
        </div>
      </div>

      {open && (
        <div className={'children-block'}>
          <LoadingIndicator visible={loading} />
          <PrimaryButton
            ghost
            size={'small'}
            label={'Agregar item'}
            icon={<PlusIcon />}
            onClick={() => {
              onAdd && onAdd(taxonomy);
            }}
          />
          {definitionDetails?.children?.map((t, i) => (
            <TaxonomyItem key={i} taxonomy={t} onDelete={onDelete} onAdd={onAdd} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxonomyItem;
