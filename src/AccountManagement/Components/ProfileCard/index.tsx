import React from 'react';
import {Avatar} from 'antd';

import {Profile} from '../../../Types/api';
import './styles.less';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard = ({profile}: ProfileCardProps) => {
  return (
    <div className={'profile-card-container'}>
      <Avatar size={120}>{profile.name.substring(0, 1)}</Avatar>
      <h2 className={'name'}>
        {profile.name} {profile.last_name}
      </h2>
      <small>{profile.email}</small>
    </div>
  );
};

export default ProfileCard;
