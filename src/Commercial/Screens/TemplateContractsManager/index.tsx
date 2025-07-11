import React, {useEffect, useState} from 'react';
import {TbContract, TbPlus, TbReload} from "react-icons/tb";
import axios from "axios";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import type {Contract} from "../../../Types/api.tsx";
import ModuleSidebar from "../../../CommonUI/ModuleSidebar";
import NavList, {NavListItem} from "../../../CommonUI/NavList";
import NavItem from "../../../Navigation/NavItem.tsx";
import {useParams} from "react-router-dom";
import IconButton from "../../../CommonUI/IconButton";
import {Empty, Space} from "antd";
import EmptyMessage from "../../../CommonUI/EmptyMessage";
import ContractItemsManager from "../../Components/ContractItemsManager";
import ModalView from "../../../CommonUI/ModalView";
import CreateContractForm from "../../Components/CommercialContractForm";

const TemplateContractsManager = () => {
  const [templates, setTemplates] = useState<Contract[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const params = useParams();
  const [selectedContract, setSelectedContract] = useState<Contract>();
  const [openNewTemplate, setOpenNewTemplate] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {is_template: true},
    };

    setLoading(true);

    axios
      .get(`commercial/contracts`, config)
      .then(response => {
        if (response) {
          setTemplates(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if(!params.contract_template) return;

    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`commercial/contracts/${params.contract_template}`, config)
      .then(response => {
        if (response) {
          setSelectedContract(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, params.contract_template]);

  return (
    <>
      <ModuleSidebar title={'Plantillas de contrato'} actions={
        <Space>
          <IconButton icon={<TbPlus />} onClick={() => setOpenNewTemplate(true)} />
          <IconButton icon={<TbReload />} onClick={() => setReload(!reload)} />
        </Space>
      }>
        {templates && templates.length == 0 && (
          <EmptyMessage message={'No hay plantillas'} />
        )}
        <NavList>
          {templates?.map((template, index) => (
            <NavListItem
              path={`/commercial/contract-templates/${template.uuid}`}
              key={index} icon={<TbContract/>}
              name={<>
                {template.title}
                <small>{template.observations}</small>
              </>}
            />
          ))}
        </NavList>
      </ModuleSidebar>
      <ModuleContent withSidebar>
        <ContentHeader title={'Valores de la plantilla'}/>
        {selectedContract && <ContractItemsManager group={'documents'} contract={selectedContract} forceToEdit={true} />}
      </ModuleContent>
      <ModalView width={700} onCancel={() => setOpenNewTemplate(false)} open={openNewTemplate}>
        <CreateContractForm contract={selectedContract} isTemplate onComplete={() => {
          setOpenNewTemplate(false);
          setReload(!reload);
        }} />
      </ModalView>
    </>
  );
};

export default TemplateContractsManager;
