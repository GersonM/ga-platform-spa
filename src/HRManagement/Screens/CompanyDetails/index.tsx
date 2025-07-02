import {useEffect, useState} from 'react';
import {Tabs} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import CompanyEditor from '../../Components/CompanyEditor';
import CompanyEmployees from "../../Components/CompanyEmployees";

const CompanyDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (params.uuid && !params.tab) {
      navigate(`/companies/${params.uuid}/info`, { replace: true });
    }
  }, [params.uuid, params.tab, navigate]);

  return (
    <ModuleContent>
      <ContentHeader title={'Información de la empresa'} onBack={() => navigate('/companies')} />
      <div>
        {params.uuid && (
          <Tabs
            onChange={tab => {
              navigate(`/companies/${params.uuid}/${tab}`);
            }}
            className={'companies-tab-bar'}
            type={'card'}
            destroyInactiveTabPane
            activeKey={params.tab}
            items={[
              {
                label: 'Información general',
                key: 'info',
                children: (
                  <div className={'companies-tab-content'}>
                    <CompanyEditor companyUuid={params.uuid} onCompleted={() => setReload(!reload)} />
                  </div>
                ),
              },
              

            ]}
          />
        )}
      </div>
    </ModuleContent>
  );
};

export default CompanyDetails;
