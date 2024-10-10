import React from 'react';
import {Avatar} from 'antd';
import './styles.less';
import {Profile} from '../../Types/api';
import LoadingIndicator from '../LoadingIndicator';

interface IProfileCardProps {
  profile?: Profile;
  caption?: string;
}

const ProfileChip = ({profile, caption}: IProfileCardProps) => {
  return (
    <div className={'profile-chip-container'}>
      <LoadingIndicator visible={!profile} />
      {profile && (
        <>
          <Avatar className={'avatar'}>G</Avatar>
          <div>
            {profile.name} {profile.last_name} <br />
            <small>{caption ? caption : profile.email}</small>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileChip;
