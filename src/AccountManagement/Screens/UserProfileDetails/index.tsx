import React, {useState} from 'react';
import {Tabs} from 'antd';
import ProfileEditor from '../../Components/ProfileEditor';
import UserSessionsManager from '../../Components/UserSessionsManager';
import PersonSubscription from '../../../PaymentManagement/Components/PersonSubscription';
import ProfilePayments from '../../../PaymentManagement/Components/ProfilePayments';
import ProfileActivity from '../../../EntityActivity/Components/ProfileActivity';
import FileActivityProfile from '../../../FileManagement/Components/FileActivityProfile';
import {useNavigate, useParams} from 'react-router-dom';

const UserProfileDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);

  return (
    <div>
      {params.uuid && (
        <Tabs
          onChange={tab => {
            navigate(`/profiles/${params.uuid}/${tab}`);
          }}
          className={'users-tab-bar'}
          type={'card'}
          destroyInactiveTabPane
          activeKey={params.tab}
          items={[
            {
              label: 'Información personal',
              style: {border: 3},
              key: 'info',
              children: (
                <div className={'users-tab-content'}>
                  <ProfileEditor profileUuid={params.uuid} onCompleted={() => setReload(!reload)} />
                </div>
              ),
            },
            {
              label: 'Sesiones',
              key: 'sessions',
              children: (
                <div className={'users-tab-content'}>
                  <UserSessionsManager profileUuid={params.uuid} />
                </div>
              ),
            },
            {
              label: 'Suscripciones',
              key: 'subscriptions',
              children: (
                <div className={'users-tab-content'}>
                  <PersonSubscription profileUuid={params.uuid} />
                </div>
              ),
            },
            {
              label: 'Finanzas',
              key: 'payments',
              children: (
                <div className={'users-tab-content'}>
                  <ProfilePayments profileUuid={params.uuid} />
                </div>
              ),
            },
            {
              label: 'Actividad',
              key: 'activity',
              children: (
                <div className={'users-tab-content'}>
                  <ProfileActivity profileUuid={params.uuid} />
                </div>
              ),
            },
            {
              label: 'Actividad de archivos',
              key: 'file-activity',
              children: (
                <div className={'users-tab-content'}>
                  <FileActivityProfile profileUuid={params.uuid} />
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default UserProfileDetails;
