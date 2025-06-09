import {useState} from 'react';
import {Steps} from 'antd';
import dayjs from 'dayjs';

import TripPassengersManager from '../../Components/ReservationAttendanceManager';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import type {MoveTrip} from '../../../Types/api';
import ReservationForm from '../../Components/ReservationForm';

const NewReservation = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTrip, setSelectedTrip] = useState<MoveTrip>();

  const createTrip = (tripData: any) => {
    setSelectedTrip(tripData);
    setCurrentStep(currentStep + 1);
  };

  const steps = [
    {
      title: 'Detalles de la reserva',
      content: (
        <div>
          <ReservationForm
            onCompleted={trip => {
              createTrip(trip);
            }}
          />
        </div>
      ),
    },
    {
      title: 'Asistentes',
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

export default NewReservation;
