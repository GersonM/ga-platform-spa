import React, {useEffect, useState} from 'react';
import {Collapse, Dropdown, type MenuProps, Progress, Space} from "antd";
import {
  TbDeviceFloppy,
  TbMenu2,
  TbPencil,
  TbPlus, TbPrinter,
  TbReload,
  TbRepeat
} from "react-icons/tb";
import axios from "axios";

import type {Contract, ContractItem} from "../../../Types/api.tsx";
import ContractItemForm from "../ContractItemForm";
import ModalView from "../../../CommonUI/ModalView";
import ContractItemViewer from "./ContractItemViewer.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import ContractTemplateSelector from '../ContractTemplateSelector/index.tsx';
import './styles.less';

interface ContractItemManagerProps {
  contract: Contract;
  forceToEdit?: boolean;
  group?: string;
}

const ContractItemsManager = ({contract, group, forceToEdit = false}: ContractItemManagerProps) => {
  const [openItemForm, setOpenItemForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContractItem>();
  const [contractItems, setContractItems] = useState<ContractItem[]>();
  const [contractItemsGroups, setContractItemsGroups] = useState<any>();
  const [editMode, setEditMode] = useState(forceToEdit);
  const [downloading, setDownloading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [tempURL, setTempURL] = useState<string>();

  useEffect(() => {
    if (!contract) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {contract_uuid: contract?.uuid, group}
    };

    setLoading(true);

    axios
      .get(`commercial/contract-items`, config)
      .then(response => {
        if (response) {
          const groups: any = {};
          response.data.forEach((item: ContractItem) => {
            if (!groups[item.group]) {
              groups[item.group] = [];
            }
            groups[item.group].push(item);
          });
          setContractItemsGroups(groups);
          setContractItems(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, contract]);

  const generateDocuments = () => {
    setOpenPrint(true);
    setDownloading(true);
    axios({
      url: 'document-generator/contract/provision',
      method: 'GET',
      params: {
        profile_uuid: contract.client?.entity.uuid,
      },
      responseType: 'blob', // important
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(response.data);
          setTempURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const updateTemplate = (templateUuid: string) => {
    setLoading(true);
    axios.post(`commercial/contracts/${contract.uuid}/template`, {template_uuid: templateUuid})
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      })
  }

  const onMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'edit':
        setEditMode(!editMode);
        break;
    }
  };

  const items = [
    {
      key: 'edit',
      icon: <TbPencil size={20}/>,
      label: editMode ? 'Terminar de edición' : 'Editar lista',
    },
    {
      key: 'save',
      icon: <TbDeviceFloppy size={20}/>,
      disabled: true,
      label: 'Guardar como plantilla',
    },
    {
      key: 'sync',
      disabled: true,
      icon: <TbRepeat size={20}/>,
      label: 'Actualizar desde plantilla',
    },
  ];

  const totalRequired = contractItems?.filter(ci => ci.is_required).length || 0;
  const totalCompleted = contractItems?.filter(ci => ci.is_required)?.filter(ci => ci.approved_at).length || 0;
  const totalFilled = contractItems?.filter(ci => ci.is_required)?.filter(ci => ci.value).length || 0;
  const percent = (totalCompleted / totalRequired) * 100;

  return (
    <div>
      <div className={'title-container'}>
        <div>
          {totalFilled} de {totalRequired} completados | {totalFilled - totalCompleted} por aprobar
          <Progress percent={contract.document_progress} success={{percent}} showInfo={true} strokeWidth={4}
                    style={{marginRight: 10}}/>
        </div>
        <Space size={"small"}>
          <LoadingIndicator visible={loading}/>
          <ContractTemplateSelector defaultValue={contract.fk_template_uuid} placeholder={'Cargar plantilla'}
                                    onChange={(value) => updateTemplate(value)}/>
          <IconButton
            title={'Imprimir documentos'}
            icon={<TbPrinter/>}
            onClick={generateDocuments}/>
          <IconButton
            onClick={() => {
              setOpenItemForm(true);
              setSelectedItem(undefined);
            }} icon={<TbPlus/>} title={'Agregar item'}/>
          <IconButton title={'Recargar'} icon={<TbReload/>} onClick={() => setReload(!reload)}/>
          <Dropdown menu={{items, onClick: onMenuClick}}>
            <IconButton icon={<TbMenu2 size={18}/>} onClick={() => setReload(!reload)}/>
          </Dropdown>
        </Space>
      </div>
      {contractItemsGroups &&
        <Collapse bordered={false} destroyOnHidden items={
          Object.keys(contractItemsGroups).map(label => {
            console.log(contractItemsGroups[label]);
            return {
              label: label,
              children: <>
                {contractItemsGroups[label].map((item: any, index: number) => {
                  return <ContractItemViewer
                    contractItem={item}
                    editMode={editMode}
                    key={index}
                    onEdit={() => {
                      setSelectedItem(item);
                      setOpenItemForm(true);
                    }}
                    onChange={() => setReload(!reload)}/>;
                })}
              </>
            };
          })}>
        </Collapse>
      }
      <ModalView
        title={'Contratos'}
        width={'80%'}
        open={openPrint}
        onCancel={() => {
          setOpenPrint(false);
          setTempURL(undefined);
        }}>
        <LoadingIndicator visible={downloading}/>
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} frameBorder="0"></iframe>}
      </ModalView>
      <ModalView
        title={selectedItem ? 'Editar item' : 'Agregar item'}
        onCancel={() => {
          setOpenItemForm(false);
        }} open={openItemForm}>
        <ContractItemForm contractItem={selectedItem} contract={contract} onComplete={() => {
          setOpenItemForm(false);
          setReload(!reload);
        }}/>
      </ModalView>
    </div>
  );
};

export default ContractItemsManager;
