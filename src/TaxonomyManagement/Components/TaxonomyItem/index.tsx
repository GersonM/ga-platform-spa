import React, {useEffect, useState} from 'react';
import {PlusIcon} from '@heroicons/react/24/solid';
import {TbArrowsMoveVertical, TbPencil, TbTrash} from 'react-icons/tb';
import {Modal, Popconfirm} from 'antd';
import {ChevronUpIcon, ChevronDownIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import {TaxonomyDefinition} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import TaxonomyForm from '../TaxonomyForm';
import './styles.less';

interface TaxonomyItemProps {
  taxonomy: TaxonomyDefinition;
  onEdit?: (t: TaxonomyDefinition) => void;
  onDelete?: (t: TaxonomyDefinition) => void;
  onAdd?: (t: TaxonomyDefinition) => void;
}

const TaxonomyItem = ({taxonomy, onEdit, onDelete, onAdd}: TaxonomyItemProps) => {
  const [open, setOpen] = useState(false);
  const [definitionDetails, setDefinitionDetails] = useState<TaxonomyDefinition>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAddForm, setOpenAddForm] = useState(false);

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
  }, [open, reload]);

  const deleteTaxonomy = (uuid: string) => {
    axios
      .delete(`taxonomy/definitions/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => ErrorHandler.showNotification(error));
  };

  return (
    <div className={'taxonomy-item-wrapper'}>
      <div className={'item-block'}>
        <div
          className={'item-switch'}
          onClick={() => {
            setOpen(!open);
          }}>
          {open ? <ChevronUpIcon height={12} /> : <ChevronDownIcon height={12} />}
        </div>
        <div className={'cover'}>
          <img src={taxonomy.cover?.thumbnail} alt="" />
        </div>
        <div className={'content'}>
          {taxonomy.name} <br />
          <small>{taxonomy.description}</small>
        </div>
        <div className={'tools'}>
          <IconButton
            title={'Editar'}
            small
            icon={<TbPencil size={18} />}
            onClick={() => {
              onEdit && onEdit(taxonomy);
            }}
          />
          <Popconfirm
            title={'¿Seguro que quieres eliminar esta taxonomía?'}
            description={'Esto eliminar todas los elementos relacionados'}
            onConfirm={() => deleteTaxonomy(taxonomy.uuid)}>
            <IconButton small icon={<TbTrash size={18} />} danger />
          </Popconfirm>
          <IconButton
            title={'Mover'}
            small
            icon={<TbArrowsMoveVertical size={18} />}
            onClick={() => {
              onEdit && onEdit(taxonomy);
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
              //onAdd && onAdd(taxonomy);
              setOpenAddForm(true);
            }}
          />
          {definitionDetails?.children?.map((t, i) => (
            <TaxonomyItem
              key={i}
              taxonomy={t}
              onDelete={onDelete}
              onAdd={() => {
                onAdd && onAdd(taxonomy);
              }}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      <Modal
        footer={false}
        open={openAddForm}
        destroyOnClose
        onCancel={() => {
          setOpenAddForm(false);
        }}
        title={'Crear nuevo'}>
        <TaxonomyForm
          parentUuid={taxonomy.uuid}
          onComplete={() => {
            setReload(!reload);
            setOpenAddForm(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default TaxonomyItem;
