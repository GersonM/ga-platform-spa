import React, {useState} from 'react';
import {Col, Divider, Input, Modal, Row} from 'antd';
import {MoveTrip, Profile} from '../../../Types/api';
import SearchProfile from '../../../CommonUI/SearchProfile';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProfile from '../../../AccountManagement/Components/CreateProfile';
import {PlusIcon} from '@heroicons/react/24/solid';

interface RegisterPassengerProps {
  trip: MoveTrip;
  onComplete?: () => void;
}

const RegisterPassenger = ({trip, onComplete}: RegisterPassengerProps) => {
  const [profileUuid, setProfileUuid] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [ledger, setLedger] = useState<string>();
  const [openNewProfileModal, setOpenNewProfileModal] = useState(false);

  const createPassenger = () => {
    axios
      .post('move/passengers', {profile_uuid: profileUuid, ledger, fk_trip_uuid: trip.uuid})
      .then(response => {
        console.log(response);
        onComplete && onComplete();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <h3>Pasajeros para {trip.route?.name}</h3>
      <Row gutter={20}>
        <Col span={12}>
          <p>Buscar persona ya registrada</p>
          <SearchProfile
            style={{marginBottom: 10}}
            onChange={(value, prof) => {
              setProfileUuid(value);
              setSelectedProfile(prof.entity);
              console.log(prof.entity);
            }}
          />
        </Col>
        <Col span={12}>
          <p>Registrar una persona nueva</p>
          <PrimaryButton
            icon={<PlusIcon />}
            ghost
            label={'Registrar nuevo'}
            block
            onClick={() => setOpenNewProfileModal(true)}
          />
        </Col>
      </Row>
      <Divider />
      {selectedProfile && (
        <div>
          <h3>
            {selectedProfile.name} {selectedProfile.last_name}
          </h3>
          <small>{selectedProfile.email}</small>
          <p>{selectedProfile.phone}</p>
          <p>
            {selectedProfile.doc_type} {selectedProfile.doc_number}
          </p>
        </div>
      )}
      <PrimaryButton
        label={'Registrar'}
        size={'large'}
        block
        disabled={!profileUuid}
        onClick={() => {
          createPassenger();
        }}
      />
      <Modal
        title={'Registrar nueva persona'}
        footer={false}
        open={openNewProfileModal}
        onCancel={() => setOpenNewProfileModal(false)}>
        <CreateProfile
          onCompleted={profile => {
            setSelectedProfile(profile);
            setProfileUuid(profile.uuid);
            setOpenNewProfileModal(false);
          }}
        />
      </Modal>
    </>
  );
};

export default RegisterPassenger;
