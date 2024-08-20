import React, {useState} from 'react';
import {Steps} from 'antd';
import axios from 'axios';

import TripPassengersManager from '../../Components/TripPassengersManager';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';
import TripForm from '../../Components/TripForm';
import dayjs from 'dayjs';

const TripReservation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTrip, setSelectedTrip] = useState<MoveTrip>();
  const [loading, setLoading] = useState(false);

  const createTrip = (tripData: any) => {
    setLoading(true);
    axios
      .post('move/trips', tripData)
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
