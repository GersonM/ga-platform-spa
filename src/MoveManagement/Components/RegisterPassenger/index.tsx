import {useState} from 'react';
import {Col, Divider, Empty, Input, Modal, Row} from 'antd';
import {PlusIcon} from '@heroicons/react/24/solid';
import type {MoveTrip, Profile} from '../../../Types/api';
import SearchProfile from '../../../CommonUI/SearchProfile';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProfile from '../../../AccountManagement/Components/CreateProfile';
import LocationsSelector from '../LocationsSelector';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';

interface RegisterPassengerProps {
  trip: MoveTrip;
  onComplete?: () => void;
}

const RegisterPassenger = ({trip, onComplete}: RegisterPassengerProps) => {
  const [profileUuid, setProfileUuid] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [observations, setObservations] = useState<string>();
  const [openNewProfileModal, setOpenNewProfileModal] = useState(false);
  const [customOrigin, setCustomOrigin] = useState<string>();
  const [customDestination, setCustomDestination] = useState<string>();

  const createPassenger = () => {
    const data = {
      profile_uuid: profileUuid,
      observations,
      fk_trip_uuid: trip.uuid,
      pickup_uuid: customOrigin,
      dropoff_uuid: customDestination,
    };

    axios
      .post('move/passengers', data)
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
              setSelectedProfile(prof.entity ? prof.entity : undefined);
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
      {selectedProfile ? (
        <Row gutter={[15, 15]}>
          <Col md={8}>
            Pasajero <br />
            <strong>
              {selectedProfile.name} {selectedProfile.last_name}
            </strong>
            <br />
            <small>
              <ProfileDocument profile={selectedProfile} />
            </small>
            <small>
              {selectedProfile.phone || ''} | {selectedProfile.email}
            </small>
          </Col>
          <Col md={8}>
            Lugar de recojo (opcional) <br />
            <LocationsSelector onChange={value => setCustomOrigin(value)} />
          </Col>
          <Col md={8}>
            Destino (opcional)
            <br />
            <LocationsSelector onChange={value => setCustomDestination(value)} />
          </Col>
          <Col md={24}>
            Observaciones (opcional)
            <Input.TextArea onChange={event => setObservations(event.target.value)} />
          </Col>
        </Row>
      ) : (
        <Empty description={'Elige una persona para poder agregarla'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      <br />
      <PrimaryButton
        label={'Registrar'}
        size={'large'}
        block
        disabled={!selectedProfile}
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
