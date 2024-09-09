import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {TbPencil, TbTrash} from 'react-icons/tb';
import {PlusIcon} from '@heroicons/react/24/solid';
import {Modal, Popconfirm, Space, Tabs} from 'antd';
import CascaderPanel from 'antd/lib/cascader/Panel';
import {useNavigate, useParams} from 'react-router-dom';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import TaxonomyForm from '../../Components/TaxonomyForm';
import {TaxonomyDefinition} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import TaxonomyItem from '../../Components/TaxonomyItem';

const TaxonomyManager = () => {
  const [taxonomies, setTaxonomies] = useState<TaxonomyDefinition[]>();
  const [reload, setReload] = useState(false);
  const [openTaxonomyForm, setOpenTaxonomyForm] = useState(false);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<TaxonomyDefinition>();
  const [selectedParent, setSelectedParent] = useState<TaxonomyDefinition>();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {},
    };

    axios
      .get(`taxonomy/definitions`, config)
      .then(response => {
        if (response) {
          setTaxonomies(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteTaxonomy = (uuid: string) => {
    axios
      .delete(`taxonomy/definitions/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => ErrorHandler.showNotification(error));
  };

  return (
    <>
      <ContentHeader title={'Taxonomías'} onRefresh={() => setReload(!reload)} onAdd={() => setOpenTaxonomyForm(true)}>
        Las taxonomías ayudan a gestionar y clasificar la información
      </ContentHeader>
      <Tabs
        animated={{inkBar: true, tabPane: true}}
        onChange={tab => {
          navigate(`/config/taxonomy/${tab}`);
        }}
        activeKey={params.taxonomy}
        items={taxonomies?.map(t => {
          return {
            label: t.name,
            key: t.uuid,
            children: (
              <>
                <Space>
                  <PrimaryButton
                    ghost
                    size={'small'}
                    icon={<PlusIcon />}
                    label={'Agregar'}
                    onClick={() => {
                      setSelectedParent(t);
                      setOpenTaxonomyForm(true);
                    }}
                  />
                  <PrimaryButton
                    size={'small'}
                    icon={<TbPencil size={18} />}
                    ghost
                    label={'Editar taxonomía'}
                    onClick={() => {
                      setSelectedTaxonomy(t);
                      setOpenTaxonomyForm(true);
                    }}
                  />
                  <Popconfirm
                    title={'¿Seguro que quieres eliminar esta taxonomía?'}
                    description={'Esto eliminar todas los elementos relacionados'}
                    onConfirm={() => deleteTaxonomy(t.uuid)}>
                    <PrimaryButton size={'small'} icon={<TbTrash size={18} />} ghost danger label={'Eliminar'} />
                  </Popconfirm>
                </Space>
                <p>{t.description}</p>
                {t.children?.map((t, i) => (
                  <TaxonomyItem
                    key={i}
                    taxonomy={t}
                    onEdit={et => {
                      setSelectedTaxonomy(et);
                      setOpenTaxonomyForm(true);
                    }}
                    onDelete={et => deleteTaxonomy(et.uuid)}
                    onAdd={et => {
                      setSelectedParent(et);
                      setOpenTaxonomyForm(true);
                    }}
                  />
                ))}
              </>
            ),
          };
        })}
      />
      <Modal
        footer={false}
        open={openTaxonomyForm}
        destroyOnClose
        onCancel={() => {
          setOpenTaxonomyForm(false);
          setSelectedTaxonomy(undefined);
          setSelectedParent(undefined);
        }}
        title={selectedTaxonomy ? 'Editar' : 'Crear taxonomía'}>
        <TaxonomyForm
          parentUuid={selectedParent?.uuid}
          entity={selectedTaxonomy}
          onComplete={() => {
            setSelectedParent(undefined);
            setSelectedTaxonomy(undefined);
            setReload(!reload);
            setOpenTaxonomyForm(false);
          }}
        />
      </Modal>
    </>
  );
};

export default TaxonomyManager;
