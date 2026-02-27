import React, {useEffect, useState} from "react";
import {Map, useMap} from '@vis.gl/react-google-maps';

import './styles.less';

const defaultProps = {
  center: {
    lat: -12.06076750888303,
    lng: -77.08113828744631
  },
  zoom: 14
};

interface MapEditorProps {
  children?: React.ReactNode;
  center?: any;
  mapId?: string;
  zoom?: number;
  debug?:boolean;
  onClick?: (position: { lat: number, lng: number } | null, placeId: string | null) => void;
}

const MapEditor = ({children, center, onClick, zoom = 14, mapId}: MapEditorProps) => {
  const map = useMap(mapId);
  const [lockCenter, setLockCenter] = useState(true);

  useEffect(() => {
    if (center && lockCenter && map) {
      map.panTo(center);
    }
  }, [center, lockCenter, map]);

  return (
    <>
      <Map
        id={mapId}
        onDrag={() => {
          setLockCenter(false);
        }}
        defaultZoom={zoom}
        defaultCenter={defaultProps.center}
        gestureHandling={'greedy'}
        onClick={(ev) => {
          if (onClick) {
            onClick(ev.detail.latLng, ev.detail.placeId);
          }
        }}
        disableDefaultUI={true}
        mapId={'6552cc943eb9a0ff948d4665'}
        style={{height: 'calc(100vh - 140px)'}}
      >
        {children}
      </Map>
    </>
  );
};

export default MapEditor;
