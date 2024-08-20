import React, {useContext, useEffect, useState} from 'react';
import {Button, Empty, Modal, Popconfirm, Space, Tooltip} from 'antd';
import {PlusIcon, TrashIcon, CheckIcon} from '@heroicons/react/24/solid';
import {MdEmojiPeople} from 'react-icons/md';
import {FaPersonWalkingLuggage} from 'react-icons/fa6';
import {CiClock1} from 'react-icons/ci';
import {PiCarLight} from 'react-icons/pi';
import {TbSteeringWheel} from 'react-icons/tb';
import dayjs from 'dayjs';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RegisterPassenger from '../RegisterPassenger';
import IconButton from '../../../CommonUI/IconButton';
import {MoveDriver, MovePassenger, MoveTrip} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import DriverSelector from '../../../CommonUI/DriverSelector';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import InfoButton from '../../../CommonUI/InfoButton';
import TripTimeEditor from './TripTimeEditor';
import './styles.less';

interface TripPassengersManagerProps {
  trip: MoveTrip;
  onChange?: () => void;
}

const TripPassengersManager = ({trip, onChange}: TripPassengersManagerProps) => {
  const {user} = useContext(AuthContext);
  const [passengers, setPassengers] = useState<MovePassenger[]>();
  const [reload, setReload] = useState(false);
  const [openPassengerModal, setOpenPassengerModal] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);
  const [openEditTime, setOpenEditTime] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<MoveDriver>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {trip_uuid: trip.uuid},
    };
    setLoading(true);

    axios
      .get(`move/passengers`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setPassengers(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const removePassenger = (uuid: string) => {
    axios
      .delete(`move/passengers/${uuid}`)
      .then(response => {
        if (response) {
          setReload(!reload);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const assignDriver = () => {
    axios
      .post(`move/trips/${trip.uuid}/assign-driver`, {driver_uuid: selectedDriver?.uuid})
      .then(() => {
        setOpenAssignDriver(false);
        setReload(!reload);
        setSelectedDriver(undefined);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const cancelTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/cancel`)
      .then(() => {
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const isAbleToAssignDriver = user?.roles?.includes('admin');

  const driver = trip.driver || trip.vehicle?.driver;
  const driverCaption = driver ? <ProfileDocument profile={driver?.profile} /> : '';
  const driverLabel = driver
    ? `${driver.profile?.name} ${driver.profile?.last_name}`
    : isAbleToAssignDriver
    ? 'Asignar \n conductor'
    : 'Sin conductor';

  return (
    <>
      <Space wrap style={{marginBottom: 15}}>
        <Tooltip title={'Conductor'}>
          <InfoButton
            onEdit={isAbleToAssignDriver ? () => setOpenAssignDriver(true) : undefined}
            icon={<TbSteeringWheel className={'icon'} />}
            caption={driverCaption}
            label={driverLabel}
          />
        </Tooltip>
        <InfoButton
          icon={<CiClock1 className={'icon'} />}
          onEdit={() => setOpenEditTime(true)}
          caption={dayjs(trip.arrival_time).format('hh:mm a')}
          label={dayjs(trip.departure_time).format('hh:mm a')}
        />
        <InfoButton
          icon={<PiCarLight className={'icon'} />}
          label={`${trip.vehicle?.brand} ${trip.vehicle?.color}`}
          caption={trip.vehicle?.registration_plate}
        />
        <PrimaryButton
          block
          disabled={!trip.vehicle || !(trip.total_passengers < trip.vehicle?.max_capacity)}
          icon={<PlusIcon />}
          onClick={() => setOpenPassengerModal(true)}
          label={'Agregar pasajero'}
        />
        <Popconfirm title={'¿Seguro que quieres cancelar este viaje?'} onConfirm={cancelTrip}>
          <Button block type={'primary'} icon={<TrashIcon />} danger>
            Cancelar
          </Button>
        </Popconfirm>
      </Space>
      <LoadingIndicator visible={loading} />
      {passengers && passengers.length == 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pasajeros para este viaje'} />
      )}
      {passengers?.map(p => {
        return (
          <div key={p.uuid} className={'passenger-item'}>
            <div className={'passenger-label'}>
              <div>
                {p.profile?.name} {p.profile?.last_name} | <ProfileDocument profile={p.profile} />
                <span className={'caption'}>
                  {p.profile?.email} | {p.profile?.phone}
                </span>
              </div>
            </div>
            {p.pickup_location && (
              <div className={'passenger-label'}>
                <MdEmojiPeople className={'passenger-icon'} />
                <div>
                  {p.pickup_location?.name}
                  <span className={'caption'}>{p.pickup_location?.address}</span>
                </div>
              </div>
            )}
            {p.drop_off_location && (
              <div className={'passenger-label'}>
                <FaPersonWalkingLuggage className={'passenger-icon'} />
                <div>
                  {p.drop_off_location?.name}
                  <span className={'caption'}>{p.drop_off_location?.address}</span>
                </div>
              </div>
            )}
            <Space>
              {user?.roles?.includes('driver') && (
                <IconButton icon={<CheckIcon />} onClick={() => removePassenger(p.uuid)} />
              )}
              <IconButton danger icon={<TrashIcon />} onClick={() => removePassenger(p.uuid)} />
            </Space>
          </div>
        );
      })}
      <Modal
        footer={false}
        title={'Asignar conductor'}
        open={openAssignDriver}
        destroyOnClose
        onCancel={() => {
          setOpenAssignDriver(false);
          setReload(!reload);
        }}>
        <p>
          Asigna el conductor para esta reserva, al momento de asignar el conductor se enviará una notificación a todos
          los usuarios
        </p>
        <DriverSelector
          placeholder={'Buscar conductor'}
          onChange={(_value, item) => setSelectedDriver(item.entity)}
          style={{width: '100%', marginBottom: 15}}
        />
        <PrimaryButton disabled={!selectedDriver} block label={'Asignar conductor'} onClick={assignDriver} />
      </Modal>
      <Modal
        footer={false}
        width={650}
        open={openPassengerModal}
        destroyOnClose
        onCancel={() => {
          setOpenPassengerModal(false);
        }}>
        <RegisterPassenger
          trip={trip}
          onComplete={() => {
            setOpenPassengerModal(false);
            setReload(!reload);
          }}
        />
      </Modal>
      <Modal
        title={'Editar reserva'}
        footer={false}
        open={openEditTime}
        destroyOnClose
        onCancel={() => {
          setOpenEditTime(false);
        }}>
        <TripTimeEditor
          trip={trip}
          onCompleted={() => {
            //setReload(!reload);
            setOpenEditTime(false);
            onChange && onChange();
          }}
        />
      </Modal>
    </>
  );
};

export default TripPassengersManager;
