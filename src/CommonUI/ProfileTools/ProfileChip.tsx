import {Avatar, Tooltip} from 'antd';
import {TbUserSquareRounded} from 'react-icons/tb';

import type {Profile} from '../../Types/api';
import LoadingIndicator from '../LoadingIndicator';
import ProfileDocument from "./ProfileDocument.tsx";
import './styles.less';

interface IProfileCardProps {
  profile?: Profile;
  caption?: string;
  showDocument?: boolean;
  small?: boolean;
}

const ProfileChip = ({profile, caption, showDocument = false, small = false}: IProfileCardProps) => {
  const content = (
    <div className={'profile-chip-container'}>
      <LoadingIndicator visible={!profile}/>
      {profile && (
        <>
          {!small &&
            <Avatar src={profile.avatar?.thumbnail} className={'avatar'}>
              <TbUserSquareRounded size={22} style={{marginTop: 6}}/>
            </Avatar>
          }
          <div>
            {profile.name} {!small && profile.last_name}
            {!small && <>
              {showDocument ? <small><ProfileDocument profile={profile}/> </small> : (
                <small>{caption ? caption : profile.email}</small>
              )}
            </>}
          </div>
        </>
      )}
    </div>
  );

  return small ?
    <Tooltip
      title={<>{profile?.name} {profile?.last_name} <br/> <small>{profile?.email}</small></>}>{content}</Tooltip> :
    content;
};

export default ProfileChip;
