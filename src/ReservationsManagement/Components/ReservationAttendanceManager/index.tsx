import React, {useContext, useEffect, useState} from 'react';
import {Drawer, Empty, Modal, Space, Tooltip} from 'antd';
import {TrashIcon, CheckIcon} from '@heroicons/react/24/solid';
import {FaUserTie} from 'react-icons/fa6';
import {PiEnvelope, PiPhoneCall, PiUserPlusBold} from 'react-icons/pi';
import {TbBuildingEstate, TbClock} from 'react-icons/tb';
import dayjs from 'dayjs';
import axios from 'axios';

import {Contract, MoveDriver, MovePassenger, MoveTrip} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RegisterPassenger from '../RegisterPassenger';
import IconButton from '../../../CommonUI/IconButton';
import AuthContext from '../../../Context/AuthContext';
import DriverSelector from '../../../CommonUI/DriverSelector';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import InfoButton from '../../../CommonUI/InfoButton';
import TripTimeEditor from './TripTimeEditor';
import EstateContractAddress from '../../../Commercial/Components/RealState/EstateContractAddress';
import TripControls from '../TripControls';
import './styles.less';
import CommercialIncidents from '../../../Commercial/Screens/CommercialIncidents';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import {Link, useNavigate} from 'react-router-dom';

interface ReservationAttendanceManagerProps {
  trip: MoveTrip;
  onChange?: () => void;
}

const ReservationAttendanceManager = ({trip, onChange}: ReservationAttendanceManagerProps) => {
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<MovePassenger[]>();
  const [reload, setReload] = useState(false);
  const [openPassengerModal, setOpenPassengerModal] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);
  const [openEditTime, setOpenEditTime] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<MoveDriver>();
  const [loading, setLoading] = useState(false);
  const [openContractIncidents, setOpenContractIncidents] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract>();

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

  const isAbleToAssignDriver = user?.roles?.includes('admin');
  const driver = trip.driver || trip.vehicle?.driver;
  const driverCaption = driver ? <ProfileDocument profile={driver?.profile} /> : '';
  const driverLabel = driver ? (
    `${driver.profile?.name} ${driver.profile?.last_name}`
  ) : isAbleToAssignDriver ? (
    <>
      Asignar <br /> encargado
    </>
  ) : (
    'Sin asesor'
  );

  return (
    <div className={'travel-info-wrapper'}>
      <LoadingIndicator fitBox={false} visible={loading} />

      <div className="tools-container">
        <Space wrap>
          <Tooltip title={'Conductor'}>
            <InfoButton
              onEdit={isAbleToAssignDriver ? () => setOpenAssignDriver(true) : undefined}
              icon={<FaUserTie className={'icon'} />}
              caption={driverCaption}
              label={driverLabel}
            />
          </Tooltip>
          <InfoButton
            icon={<TbClock className={'icon'} />}
            onEdit={() => setOpenEditTime(true)}
            caption={dayjs(trip.arrival_time).format('hh:mm a')}
            label={dayjs(trip.departure_time).format('hh:mm a')}
          />
          <InfoButton
            icon={<TbBuildingEstate className={'icon'} />}
            label={`${trip.vehicle?.model} ${trip.vehicle?.color}`}
            caption={trip.vehicle?.brand}
          />
        </Space>
        <Space wrap>
          {!trip.arrived_at && (
            <PrimaryButton
              ghost
              size={'small'}
              disabled={!trip.vehicle || !(trip.total_passengers < trip.vehicle?.max_capacity)}
              icon={<PiUserPlusBold size={18} />}
              onClick={() => setOpenPassengerModal(true)}
              label={'Agregar persona'}
            />
          )}
          <TripControls trip={trip} onChange={onChange} />
        </Space>
      </div>

      {passengers && passengers.length == 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pasajeros para este viaje'} />
      )}

      {passengers?.map((p, index) => {
        return (
          <div key={p.uuid} className={'assistant-item'}>
            <div className={'icon'}>#{index + 1}</div>
            <div style={{flex: 1}}>
              <div className={'content'}>
                <div className={'passenger-label'}>
                  <div>
                    <ProfileDocument profile={p.profile} /> | {p.profile?.name} {p.profile?.last_name}
                    <span className={'caption'}>
                      <PiEnvelope /> {p.profile?.personal_email || 'Sin correo'} | <PiPhoneCall /> {p.profile?.phone}
                    </span>
                  </div>
                </div>
                <Space wrap>
                  {p.profile?.commercial_client?.contracts?.map((c, index) => {
                    return (
                      <EstateContractAddress
                        tooltip={'Ver incidencias'}
                        key={index}
                        contract={c}
                        onEdit={() => {
                          setSelectedContract(c);
                          setOpenContractIncidents(true);
                        }}
                      />
                    );
                  })}
                  {user?.roles?.includes('driver') && (
                    <IconButton icon={<CheckIcon />} onClick={() => removePassenger(p.uuid)} />
                  )}
                  <IconButton danger icon={<TrashIcon />} onClick={() => removePassenger(p.uuid)} />
                </Space>
              </div>

              {(p.observations ||
                (p.profile?.employees && p.profile?.employees[0] && p.profile?.employees[0].cost_center)) && (
                <div className={'addons'}>
                  {p.profile?.employees && p.profile?.employees[0] && (
                    <div>
                      <span className={'label'}>Centro de costos:</span> {p.profile?.employees[0].cost_center}
                    </div>
                  )}
                  {p.observations && (
                    <div>
                      <span className={'label'}>Observaciones:</span> {p.observations}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <Modal
        footer={false}
        title={'Asignar encargado'}
        open={openAssignDriver}
        destroyOnClose
        onCancel={() => {
          setOpenAssignDriver(false);
          setReload(!reload);
        }}>
        <p>
          Asigna el encargado de atender esta reserva, al momento de asignar al encargado se enviará una notificación a
          todos los usuarios
        </p>
        <DriverSelector
          placeholder={'Buscar encargado'}
          onChange={(_value, item) => setSelectedDriver(item.entity)}
          style={{width: '100%', marginBottom: 15}}
        />
        <PrimaryButton disabled={!selectedDriver} block label={'Asignar encargado'} onClick={assignDriver} />
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
            setOpenEditTime(false);
            onChange && onChange();
          }}
        />
      </Modal>
      <Drawer
        open={openContractIncidents}
        destroyOnClose
        title={
          <Link to={`/commercial/contracts/${selectedContract?.uuid}`} target={'_blank'}>
            <EstateContractAddress contract={selectedContract} tooltip={'Abrir en otra pestaña'} />
          </Link>
        }
        onClose={() => setOpenContractIncidents(false)}>
        {selectedContract && <EntityActivityManager uuid={selectedContract?.uuid} type={'commercial-contract'} />}
      </Drawer>
    </div>
  );
};

export default ReservationAttendanceManager;
