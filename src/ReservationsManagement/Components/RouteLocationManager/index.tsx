import React, {useState} from 'react';
import {MapPinIcon, TrashIcon} from '@heroicons/react/16/solid';
import {Divider, Space, Timeline} from 'antd';
import axios from 'axios';

import {MoveRoute} from '../../../Types/api';
import LocationsSelector from '../LocationsSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';

interface RouteLocationManagerProps {
  route: MoveRoute;
  onChange?: () => void;
}

const RouteLocationManager = ({route, onChange}: RouteLocationManagerProps) => {
  const [locationUuid, setLocationUuid] = useState<string>();
  const [reload, setReload] = useState(false);

  const addLocation = () => {
    axios
      .post(`move/routes/${route.uuid}/add-location`, {location_uuid: locationUuid})
      .then(() => {
        setReload(!reload);
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const removeLocation = (uuid: string) => {
    axios
      .post(`move/routes/${route.uuid}/remove-location`, {location_uuid: uuid})
      .then(() => {
        setReload(!reload);
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <Space>
        <LocationsSelector value={locationUuid} onChange={value => setLocationUuid(value)} />
        <PrimaryButton label={'Agregar'} onClick={addLocation} />
      </Space>
      <Divider />
      <Timeline
        items={route?.locations?.map(a => {
          return {
            dot: <MapPinIcon width={20} />,
            children: (
              <Space>
                {a.name} <br />
                <IconButton icon={<TrashIcon />} onClick={() => removeLocation(a.uuid)} />
              </Space>
            ),
          };
        })}
      />
    </div>
  );
};

export default RouteLocationManager;
