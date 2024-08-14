import React, {useState} from 'react';
import {Steps} from 'antd';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import VehicleListSelector from './VehicleListSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveTrip, MoveVehicle} from '../../../Types/api';
import TripPassengersManager from '../../Components/TripPassengersManager';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {CheckIcon} from '@heroicons/react/24/solid';

const TripReservation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();
  const [selectedTrip, setSelectedTrip] = useState<MoveTrip>();
  const [tripDetails, setTripDetails] = useState<any>();
  const [loading, setLoading] = useState(false);

  const createTrip = (trip: MoveTrip) => {
    setLoading(true);
    const data = {
      ...tripDetails,
      fk_vehicule_uuid: selectedVehicle?.uuid,
    };
    axios
      .post('move/trips', data)
      .then(response => {
        setLoading(false);
        setSelectedTrip(response.data);
        setCurrentStep(currentStep + 1);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const steps = [
    {
      title: 'Lugar y fecha',
      content: (
        <div>
          <TripForm
            showVehicle={false}
            onCompleted={trip => {
              setCurrentStep(currentStep + 1);
              setTripDetails(trip);
            }}
          />
        </div>
      ),
    },
    {
      title: 'Unidad',
      content: (
        <div>
          <VehicleListSelector onChange={v => setSelectedVehicle(v)} />
          <PrimaryButton
            icon={<CheckIcon />}
            loading={loading}
            block
            disabled={!selectedVehicle}
            onClick={createTrip}
            label={'Crear reserva'}
          />
        </div>
      ),
    },
    {
      title: 'Pasajeros',
      content: <div>{selectedTrip && <TripPassengersManager trip={selectedTrip} />}</div>,
    },
  ];

  return (
    <>
      <ContentHeader title={'Reserva'} />
      <Steps
        current={currentStep}
        items={steps}
        onChange={step => {
          setCurrentStep(step);
        }}
      />
      <div className={'reservation-step-container'}>{steps[currentStep].content}</div>
    </>
  );
};

export default TripReservation;
