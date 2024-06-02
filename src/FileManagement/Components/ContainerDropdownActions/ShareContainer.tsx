import React, {useState} from 'react';
import {Button, Input, List, notification} from 'antd';
import {Container, Profile} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ShareContainerProps {
  container: Container;
  onCompleted?: () => void;
}

const ShareContainer = ({container, onCompleted}: ShareContainerProps) => {
  const [userEmail, setUserEmail] = useState<string>();
  const [profiles, setProfiles] = useState<Profile[]>();

  const fetchProfiles = () => {
    axios
      .get('hr-management/profiles', {params: {search: userEmail}})
      .then(response => {
        setProfiles(response.data.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const shareProfile = (profile: Profile) => {
    console.log({profile});
    axios
      .post(`file-management/containers/${container.uuid}/share`, {profile_uuid: profile.uuid})
      .then(response => {
        notification.success({message: 'Acceso compartido'});
        onCompleted && onCompleted();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <h2>Compartir acceso a "{container.name}"</h2>
      <p>Buscar a una persona por su nombre o correo para permitirle ver el contenido de esta carpeta.</p>
      <Input.Search
        placeholder="Ingrese correo electrónico"
        value={userEmail}
        onSearch={value => setUserEmail(value)}
        onChange={e => setUserEmail(e.target.value)}
        onPressEnter={fetchProfiles}
      />
      <List
        dataSource={profiles}
        renderItem={profile => (
          <List.Item
            actions={[
              <Button type="primary" onClick={() => shareProfile(profile)}>
                Compartir
              </Button>,
            ]}>
            <List.Item.Meta title={profile.name} description={profile.email} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ShareContainer;
