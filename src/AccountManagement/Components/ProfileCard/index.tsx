import React, {useState} from 'react';
import {Avatar} from 'antd';

import {Profile, File} from '../../../Types/api';
import './styles.less';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ProfileCardProps {
  profile: Profile;
  allowEdit?: boolean;
}

const ProfileCard = ({profile, allowEdit}: ProfileCardProps) => {
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAvatarChange = (file: File) => {
    console.log(file);
    setLoading(true);
    axios
      .put(`hr-management/profiles/${profile.uuid}`, {avatar_uuid: file.uuid})
      .then(response => {
        if (response) {
          setShowUploader(false);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div className={'profile-card-container'}>
      <div className={'avatar'}>
        {showUploader ? (
          <FileUploader onFilesUploaded={onAvatarChange} height={120} />
        ) : (
          <Avatar size={120} src={profile.avatar?.thumbnail}>
            {profile.name.substring(0, 1)}
          </Avatar>
        )}
      </div>
      {allowEdit && (
        <PrimaryButton onClick={() => setShowUploader(!showUploader)} ghost size={'small'} label={'Actualizar foto'} />
      )}
      <h2 className={'name'}>
        {profile.name} {profile.last_name}
      </h2>
      <small>{profile.email}</small>
    </div>
  );
};

export default ProfileCard;
