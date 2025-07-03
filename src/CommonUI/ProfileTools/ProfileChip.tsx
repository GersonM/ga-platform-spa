
import {Avatar} from 'antd';
import {TbUserSquareRounded} from 'react-icons/tb';

import type {Profile} from '../../Types/api';
import LoadingIndicator from '../LoadingIndicator';
import './styles.less';

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
          <Avatar src={profile.avatar?.thumbnail} className={'avatar'}>
            <TbUserSquareRounded size={22} style={{marginTop: 6}} />
          </Avatar>
          <div>
            {profile.name} {profile.last_name}
            <small>{caption ? caption : profile.email}</small>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileChip;
