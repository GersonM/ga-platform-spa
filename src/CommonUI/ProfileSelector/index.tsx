import React, {useEffect, useState} from 'react';
import {Modal} from 'antd';
import axios from 'axios';
import {PiPlusBold} from 'react-icons/pi';

import {Profile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import SearchProfile from '../SearchProfile';
import PrimaryButton from '../PrimaryButton';
import CreateProfile from '../../AccountManagement/Components/CreateProfile';

interface ProfileSelectorProps {
  placeholder?: string;
  exclude?: string;
  filter?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  value?: string | string[];
  disabled?: boolean;
  allowCreate?: boolean;
  style?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProfileSelector = ({
  placeholder,
  mode,
  exclude,
  filter,
  value,
  onChange,
  allowCreate = true,
  ...props
}: ProfileSelectorProps) => {
  const [openCreateProfile, setOpenCreateProfile] = useState(false);

  return (
    <div>
      <div style={{display: 'flex'}}>
        <SearchProfile
          style={{flex: 1}}
          onChange={(values, item) => {
            //setSelectedProfile(item);
            onChange && onChange(values, item);
          }}
        />
        {allowCreate && (
          <PrimaryButton
            onClick={() => setOpenCreateProfile(true)}
            icon={<PiPlusBold size={14} />}
            style={{marginLeft: 8}}
            label={'Nuevo'}
          />
        )}
      </div>
      <Modal
        title={'Registrar nueva persona'}
        footer={false}
        open={openCreateProfile}
        onCancel={() => setOpenCreateProfile(false)}>
        <CreateProfile
          onCompleted={profile => {
            //setSelectedProfile(profile);
            setOpenCreateProfile(false);
            onChange && onChange(profile.uuid, profile);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProfileSelector;
