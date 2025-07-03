import {useEffect, useState} from 'react';
import {Empty, Tabs} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import CompanyEmployees from "../../Components/CompanyEmployees";
import CompanyForm from "../../Components/CompanyForm";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {Company} from "../../../Types/api.tsx";
import {TbInfoCircle, TbLayersSelected, TbReceiptTax, TbUsers} from "react-icons/tb";

const CompanyDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [company, setCompany] = useState<Company>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.uuid) {
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get(`hr-management/companies/${params.uuid}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCompany(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [params.uuid, reload]);

  return (
    <ModuleContent>
      <ContentHeader title={'Información de ' + company?.name} onBack={() => navigate('/companies')}/>
      {params.uuid && (
        <Tabs
          onChange={tab => {
            navigate(`/companies/${params.uuid}/${tab}`);
          }}
          destroyOnHidden
          activeKey={params.tab}
          items={[
            {
              icon: <TbInfoCircle size={23} style={{marginBottom: '-7px'}}/>,
              label: 'Información general',
              key: 'info',
              children: (
                <CompanyForm company={company} onComplete={() => setReload(!reload)}/>
              ),
            },
            {
              icon: <TbUsers size={23} style={{marginBottom: '-7px'}}/>,
              label: 'Empleados',
              key: 'employees',
              children: (
                <CompanyEmployees companyUuid={params.uuid}/>
              ),
            },
            {
              icon: <TbLayersSelected size={23} style={{marginBottom: '-7px'}}/>,
              label: 'Grupos',
              key: 'groups',
              children: (<Empty/>)
            },
            {
              icon: <TbReceiptTax size={23} style={{marginBottom: '-7px'}}/>,
              label: 'Información financiera',
              key: 'finances',
              children: (<Empty/>)
            },
          ]}
        />
      )}
    </ModuleContent>
  );
};

export default CompanyDetails;
