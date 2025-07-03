import {Avatar} from 'antd';
import {TbUserSquareRounded} from 'react-icons/tb';

import type {Profile} from '../../Types/api';
import LoadingIndicator from '../LoadingIndicator';
import ProfileDocument from "./ProfileDocument.tsx";
import './styles.less';

interface IProfileCardProps {
  profile?: Profile;
  caption?: string;
  showDocument?: boolean;
}

const ProfileChip = ({profile, caption, showDocument = false}: IProfileCardProps) => {
  return (
    <div className={'profile-chip-container'}>
      <LoadingIndicator visible={!profile}/>
      {profile && (
        <>
          <Avatar src={profile.avatar?.thumbnail} className={'avatar'}>
            <TbUserSquareRounded size={22} style={{marginTop: 6}}/>
          </Avatar>
          <div>
            {profile.name} {profile.last_name}
            {showDocument ? <small><ProfileDocument profile={profile}/> </small> : (
              <small>{caption ? caption : profile.email}</small>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileChip;
