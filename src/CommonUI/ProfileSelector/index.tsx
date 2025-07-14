import {useState} from 'react';
import {PiPlusBold} from 'react-icons/pi';

import SearchProfile from '../SearchProfile';
import PrimaryButton from '../PrimaryButton';
import CreateProfile from '../../AccountManagement/Components/CreateProfile';
import type {Profile} from "../../Types/api.tsx";
import ModalView from "../ModalView";

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
  onChange,
  allowCreate = true
}: ProfileSelectorProps) => {
  const [openCreateProfile, setOpenCreateProfile] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<Profile>();

  return (
    <div>
      <div style={{display: 'flex'}}>
        <SearchProfile
          style={{flex: 1}}
          placeholder={createdProfile?.name}
          onChange={(values, item) => {
            //setSelectedProfile(item);
            if (onChange) {
              onChange(values, item);
            }
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
      <ModalView
        title={'Registrar nueva persona'}
        open={openCreateProfile}
        onCancel={() => setOpenCreateProfile(false)}>
        <CreateProfile
          onCompleted={profile => {
            //setSelectedProfile(profile);
            setCreatedProfile(profile);
            setOpenCreateProfile(false);
            if (onChange) {
              onChange(profile.uuid, profile);
            }
          }}
        />
      </ModalView>
    </div>
  );
};

export default ProfileSelector;
