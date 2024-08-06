import React, {useState} from 'react';
import {Steps} from 'antd';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import VehicleSelector from '../../Components/VehicleSelector';
import TripForm from '../../Components/TripForm';
import VehicleListSelector from './VehicleListSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveTrip, MoveVehicle} from '../../../Types/api';
import TripPassengersManager from '../../Components/TripPassengersManager';

const TripReservation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();
  const [selectedTrip, setSelectedTrip] = useState<MoveTrip>();

  const steps = [
    {
      title: 'Unidad',
      content: (
        <div>
          <VehicleListSelector onChange={v => setSelectedVehicle(v)} />
          <PrimaryButton block disabled={!selectedVehicle} onClick={() => setCurrentStep(1)} label={'Continuar'} />
        </div>
      ),
    },
    {
      title: 'Fecha',
      content: (
        <div>
          <TripForm
            vehicle={selectedVehicle}
            onCompleted={trip => {
              setCurrentStep(currentStep + 1);
              setSelectedTrip(trip);
            }}
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
