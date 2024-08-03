import React, {useState} from 'react';
import {Divider, Input} from 'antd';
import {MoveTrip} from '../../../Types/api';
import SearchProfile from '../../../CommonUI/SearchProfile';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ProfileCard from '../../../AccountManagement/Components/ProfileCard';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface RegisterPassengerProps {
  trip: MoveTrip;
  onComplete?: () => void;
}

const RegisterPassenger = ({trip, onComplete}: RegisterPassengerProps) => {
  const [profileUuid, setProfileUuid] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [ledger, setLedger] = useState<string>();

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
      {!selectedProfile ? (
        <>
          <SearchProfile style={{marginBottom: 10}} onChange={value => setProfileUuid(value)} />
          <PrimaryButton
            label={'Continuar'}
            block
            disabled={!profileUuid}
            onClick={() => {
              setSelectedProfile(true);
            }}
          />
          <Divider />
          <PrimaryButton label={'Registrar nuevo'} block disabled={true} />
        </>
      ) : (
        <>
          <Input
            placeholder={'Código'}
            onChange={value => {
              setLedger(value.target.value);
            }}
          />
          <PrimaryButton
            label={'Reservar'}
            block
            disabled={!ledger}
            onClick={() => {
              createPassenger();
            }}
          />
        </>
      )}
    </>
  );
};

export default RegisterPassenger;
