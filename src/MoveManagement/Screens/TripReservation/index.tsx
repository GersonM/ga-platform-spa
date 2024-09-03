import React, {useState} from 'react';
import {Steps} from 'antd';
import dayjs from 'dayjs';

import TripPassengersManager from '../../Components/TripPassengersManager';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {MoveTrip} from '../../../Types/api';
import TripForm from '../../Components/TripForm';

const TripReservation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTrip, setSelectedTrip] = useState<MoveTrip>();
  const [loading, setLoading] = useState(false);

  const createTrip = (tripData: any) => {
    setSelectedTrip(tripData);
    setCurrentStep(currentStep + 1);
  };

  const steps = [
    {
      title: 'Lugar y fecha',
      content: (
        <div>
          <TripForm
            onCompleted={trip => {
              createTrip(trip);
            }}
          />
        </div>
      ),
    },
    {
      title: 'Pasajeros',
      content: (
        <div>
          <h3>{dayjs(selectedTrip?.departure_time).format('DD [de] MMMM [del] YYYY')}</h3>
          {selectedTrip && <TripPassengersManager trip={selectedTrip} />}
        </div>
      ),
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
