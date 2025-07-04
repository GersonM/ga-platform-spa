import React, {useEffect, useState} from 'react';
import {Dropdown, type MenuProps, Progress, Space} from "antd";
import axios from "axios";

import type {Contract, ContractItem} from "../../../Types/api.tsx";
import ContractItemForm from "../ContractItemForm";
import ModalView from "../../../CommonUI/ModalView";
import ContractItemViewer from "./ContractItemViewer.tsx";
import './styles.less';
import {
  TbDeviceFloppy,
  TbMenu2,
  TbPencil,
  TbPlus, TbPrinter,
  TbReload,
  TbRepeat
} from "react-icons/tb";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";

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
      params: {contract_uuid: contract?.uuid}
    };

    setLoading(true);

    axios
      .get(`commercial/contract-items`, config)
      .then(response => {
        if (response) {
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

  const onMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
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
      label: editMode?'Terminar de edición':'Editar lista',
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
  const percentFilled = (totalFilled / totalRequired) * 100;
  const percent = (totalCompleted / totalRequired) * 100;

  return (
    <div>
      <div className={'title-container'}>
        <div>
          {totalFilled} de {totalRequired} completados | {totalFilled-totalCompleted} por aprobar
          <Progress percent={percentFilled} success={{percent}} showInfo={true} style={{marginRight: 10}}/>
        </div>
        <Space size={"small"}>
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
      {contractItems?.map((item, index) => {
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
        title={'Editar item'}
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
