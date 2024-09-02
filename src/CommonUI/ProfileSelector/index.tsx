import React, {useEffect, useState} from 'react';
import {Col, Modal, Row} from 'antd';
import axios from 'axios';
import {Profile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import SearchProfile from '../SearchProfile';
import PrimaryButton from '../PrimaryButton';
import {PlusIcon} from '@heroicons/react/24/solid';
import CreateProfile from '../../AccountManagement/Components/CreateProfile';

interface ProfileSelectorProps {
  placeholder?: string;
  exclude?: string;
  filter?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  value?: string | string[];
  disabled?: boolean;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProfileSelector = ({placeholder, mode, exclude, filter, value, onChange, ...props}: ProfileSelectorProps) => {
  const [users, setUsers] = useState<Profile | any>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateProfile, setOpenCreateProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile>();

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`hr-management/profiles`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setUsers(
            response.data.data.map((item: Profile) => {
              return {value: item.uuid, label: `${item.name} ${item.last_name}`, entity: item};
            }),
          );
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <div>
      <Row gutter={15}>
        <Col span={12}>
          <SearchProfile
            onChange={(values, item) => {
              setSelectedProfile(item);
              onChange && onChange(values, item);
            }}
          />
        </Col>
        <Col span={12}>
          <PrimaryButton
            onClick={() => setOpenCreateProfile(true)}
            icon={<PlusIcon />}
            block
            label={'Registrar nuevo'}
          />
        </Col>
      </Row>
      <Modal
        title={'Registrar nueva persona'}
        footer={false}
        open={openCreateProfile}
        onCancel={() => setOpenCreateProfile(false)}>
        <CreateProfile
          onCompleted={profile => {
            setSelectedProfile(profile);
            setOpenCreateProfile(false);
            onChange && onChange(profile.uuid, profile);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProfileSelector;
