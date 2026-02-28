import React, {useEffect, useMemo, useRef, useState} from 'react';
import {AdvancedMarker, APIProvider, useMap} from "@vis.gl/react-google-maps";
import Draggable from 'react-draggable';
import {Empty} from 'antd';
import axios from "axios";

import type {StorageStock, StorageWarehouse} from '../../../Types/api.tsx';

import MapsEditor from "../../../CommonUI/MapsEditor";
import StockCard from "../StockCard";
import './styles.less';

type StockLocationsMapProps = {
  warehouse?: StorageWarehouse;
  status?: string;
  search?: string;
};

type MappedPoint = {
  uuid: string;
  serie?: string;
  status: string;
  title: string;
  stock: StorageStock;
  warehouse: string;
  lat: number;
  lng: number;
};

type OverlayBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const getNumericValue = (value: unknown, keys: string[]) => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source = value as Record<string, unknown>;

  for (const key of keys) {
    const current = source[key];

    if (typeof current === 'number' && Number.isFinite(current)) {
      return current;
    }

    if (typeof current === 'string') {
      const parsed = Number(current);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const GOOGLE_MAPS_API_KEY = "AIzaSyB56vowFyYH2y7SvbnEOWPPlG-eYJvV1CM";

const getLatLngPoint = (value: unknown) => {
  const lat = getNumericValue(value, ['lat', 'latitude', 'y']);
  const lng = getNumericValue(value, ['lng', 'longitude', 'x']);

  if (lat === undefined || lng === undefined) {
    return undefined;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return undefined;
  }

  return {lat, lng};
};

const getOverlayBounds = (warehouse?: StorageWarehouse): OverlayBounds | undefined => {
  const topLeft = getLatLngPoint(warehouse?.distribution_top_left_bound);
  const bottomRight = getLatLngPoint(warehouse?.distribution_bottom_right_bound);

  if (!topLeft || !bottomRight) {
    return undefined;
  }

  return {
    north: Math.max(topLeft.lat, bottomRight.lat),
    south: Math.min(topLeft.lat, bottomRight.lat),
    east: Math.max(topLeft.lng, bottomRight.lng),
    west: Math.min(topLeft.lng, bottomRight.lng),
  };
};

const WarehouseImageOverlay = ({warehouse}: { warehouse?: StorageWarehouse }) => {
  const map = useMap('locations-seller');
  const imageUrl = warehouse?.distribution_file?.source || warehouse?.distribution_file?.thumbnail;
  const bounds = getOverlayBounds(warehouse);

  useEffect(() => {
    if (!map || !imageUrl || !bounds) {
      return;
    }

    const w = window as any;
    if (!w.google?.maps) {
      return;
    }

    const overlay = new w.google.maps.GroundOverlay(imageUrl, bounds, {opacity: 1});
    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map, imageUrl, bounds?.north, bounds?.south, bounds?.east, bounds?.west]);

  return null;
};

const MapAutoFit = ({points}: { points: MappedPoint[] }) => {
  const map = useMap('locations-seller');

  useEffect(() => {
    if (!map || points.length === 0) {
      return;
    }

    const w = window as any;
    if (!w.google?.maps) {
      return;
    }

    if (points.length === 1) {
      map.setCenter({lat: points[0].lat, lng: points[0].lng});
      map.setZoom(16);
      return;
    }

    const bounds = new w.google.maps.LatLngBounds();
    points.forEach(point => bounds.extend({lat: point.lat, lng: point.lng}));
    map.fitBounds(bounds, 50);
  }, [map, points]);

  return null;
};

const StockLocationsMap = ({warehouse, search, status}: StockLocationsMapProps) => {
  const [stocks, setStocks] = useState<StorageStock[]>();
  const nodeRef = useRef(null);
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [selectedStockPoint, setSelectedStockPoint] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        warehouse_uuid: warehouse?.uuid,
        search,
        status
      },
    };

    axios
      .get(`warehouses/stock/locations`, config)
      .then(response => {
        if (response) {
          setStocks(response.data);
        }
      })
      .catch(() => {
      });

    return cancelTokenSource.cancel;
  }, [warehouse, status, search]);

  useEffect(() => {
    if (!selectedStockPoint) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`warehouses/stock/${selectedStockPoint}`, config)
      .then(response => {
        if (response) {
          setSelectedStock(response.data);
        }
      })
      .catch(() => {
      });

    return cancelTokenSource.cancel;
  }, [selectedStockPoint]);

  const points = useMemo<MappedPoint[]>(() => {
    const source = (stocks || []).map(stock => {
      const coordinate = getLatLngPoint(stock.distribution_coordinate as unknown);

      return {
        stock,
        coordinate,
      };
    }).filter(item => {
      return !!item.coordinate;
    });

    return source.map(item => {
      return {
        uuid: item.stock.uuid,
        status: item.stock.status,
        stock: item.stock,
        serie: item.stock.serial_number,
        title: item.stock.full_name || item.stock.name || item.stock.serial_number || 'Stock sin nombre',
        warehouse: item.stock.warehouse?.name || 'Sin almacén',
        lat: item.coordinate?.lat as number,
        lng: item.coordinate?.lng as number,
      };
    });
  }, [stocks]);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <section className={'stock-locations-map'}>
        {selectedStock && (
          <Draggable nodeRef={nodeRef} handle={'.image-container'}>
            <div className={'stock-information'} ref={nodeRef}>
              <StockCard onClose={() => {
                setSelectedStockPoint(undefined);
                setSelectedStock(undefined);
              }} stock={selectedStock}/>
            </div>
          </Draggable>)}
        {points.length === 0 ? (
          <div className={'map-empty'}>
            <Empty description={'No hay coordenadas de ubicación para mostrar en este momento.'}/>
          </div>
        ) : (
          <MapsEditor mapId={'locations-seller'}>
            <WarehouseImageOverlay warehouse={warehouse}/>
            <MapAutoFit points={points}/>
            {points?.map((p, i) => {
              return <React.Fragment key={'pp_' + i}>
                <AdvancedMarker
                  anchorLeft={'-50%'}
                  anchorTop={'-50%'}
                  position={p}
                  title={p.title}
                  className={`stock-marker ${p.status} ${p.stock.sale_price === null ? 'no-price' : ''} ${selectedStockPoint ? (p.stock.uuid == selectedStockPoint ? 'selected' : 'hidden') : ''}`}
                  onClick={() => setSelectedStockPoint(p.stock.uuid)}
                >
                  <span className={'point'}></span>
                </AdvancedMarker>
              </React.Fragment>
            })}
          </MapsEditor>
        )}
      </section>
    </APIProvider>
  );
};

export default StockLocationsMap;
