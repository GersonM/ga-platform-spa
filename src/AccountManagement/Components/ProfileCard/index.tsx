import React, {useState} from 'react';
import {Avatar} from 'antd';
import axios from 'axios';

import {Profile, File} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import './styles.less';

interface ProfileCardProps {
  profile: Profile;
  allowEdit?: boolean;
  onChange?: () => void;
}

const ProfileCard = ({profile, onChange, allowEdit = true}: ProfileCardProps) => {
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAvatarChange = (file: File) => {
    setLoading(true);
    axios
      .put(`hr-management/profiles/${profile.uuid}`, {avatar_uuid: file.uuid})
      .then(() => {
        setLoading(false);
        onChange && onChange();
        setShowUploader(false);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div className={'profile-card-container'}>
      <LoadingIndicator visible={loading} message={'Guardando foto...'} />
      <div className={'avatar'}>
        {showUploader ? (
          <FileUploader showPreview={true} onFilesUploaded={onAvatarChange} height={120} />
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
