import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Empty, Tag} from 'antd';

import {MoveVehicle} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import './styles.less';
import {Dayjs} from 'dayjs';
import Config from '../../../Config';
import {GrCar} from 'react-icons/gr';
import {PiCarProfile} from 'react-icons/pi';
import {
  ExclamationTriangleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {FaHelmetSafety, FaHelmetUn} from 'react-icons/fa6';

interface VehicleListSelectorProps {
  value?: string;
  departureTime?: Dayjs;
  arrivalTime?: Dayjs;
  onChange?: (value: string, vehicle: MoveVehicle) => void;
}

const VehicleListSelector = ({onChange, departureTime, arrivalTime, value}: VehicleListSelectorProps) => {
  const [vehicles, setVehicles] = useState<MoveVehicle | any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        departure_time: departureTime?.format(Config.datetimeFormatServer),
        arrival_time: arrivalTime?.format(Config.datetimeFormatServer),
      },
    };

    axios
      .get(`move/vehicles`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setVehicles(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [arrivalTime, departureTime]);

  const getIcon = (path?: string) => {
    path = path?.toLowerCase();
    switch (path) {
      case 'equipo':
        return <FaHelmetSafety className={'icon'} />;
      default:
        return <PiCarProfile className={'icon'} />;
    }
  };

  return (
    <div>
      <LoadingIndicator visible={loading} />
      {vehicles && vehicles.length == 0 && (
        <Empty description={'No hay vehículos disponibles'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <ul className={'vehicle-list'}>
        {vehicles.map((vehicle: MoveVehicle) => {
          return (
            <li
              key={vehicle.uuid}
              className={`${selectedVehicle && selectedVehicle.uuid == vehicle.uuid ? 'selected' : ''}`}
              onClick={() => {
                setSelectedVehicle(vehicle);
                onChange && onChange(vehicle.uuid, vehicle);
              }}>
              {getIcon(vehicle.type)}
              <div className={'vehicle-info'}>
                {vehicle.brand} {vehicle.model} {vehicle.color}
                <br />
                <small>
                  {vehicle.type}: Max. {vehicle.max_capacity} personas
                </small>
              </div>
              <div>
                <Tag>{vehicle.registration_plate}</Tag> <br />
                <Tag color={'blue'}>{vehicle.circulation_card || 'Sin tarjeta'}</Tag>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VehicleListSelector;
