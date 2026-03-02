import React, {useEffect, useState} from 'react';
import type {Contract} from "../../../Types/api.tsx";
import axios from "axios";
import MoneyString from "../../../CommonUI/MoneyString";
import PeriodChip from "../../../CommonUI/PeriodChip";
import {Button, Space, Tooltip} from "antd";
import {TbRefreshDot} from "react-icons/tb";
import dayjs from "dayjs";
import ContractList from "../../Screens/CommercialClients/ContractList.tsx";
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";

const ContractsRenovationList = () => {
  const [contracts, setContracts] = useState<Contract[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`commercial/contracts/next-to-expiry`, config)
      .then(response => {
        if (response) {
          setContracts(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);


  return (
    <div>
      <h2>Contratos por renovar</h2>
      <Button onClick={() => setReload(!reload)}>Recargar</Button>
      <div>

        <ContractList contracts={contracts}/>
        {contracts?.map((contract, index) => (
          <Space key={index} style={{marginBottom: 10}}>
            <div>
              {contract.title}
              <code>{contract.tracking_id}</code>
            </div>
            {contract.client?.type.includes('Company') ?
              <CompanyChip company={contract.client?.entity}/> :
              <ProfileChip profile={contract.client?.entity} showDocument/>
            }
            <div>
              <code>{dayjs(contract.next_renew_date).fromNow()}</code>
            </div>
            <PeriodChip period={contract.period}/>
            <div>
              <>
                {contract.totals && Object.entries(contract.totals).map(([key, value]) => {
                  return <MoneyString currency={key} key={key} value={value}/>;
                })}
                <br/>
              </>
            </div>
            {contract.is_renewable ? <Tooltip title={'Renovación automática activa'}><TbRefreshDot/></Tooltip> : ''}
          </Space>
        ))}
      </div>
    </div>
  );
};

export default ContractsRenovationList;
