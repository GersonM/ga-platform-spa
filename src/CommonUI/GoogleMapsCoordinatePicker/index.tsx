import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Input, Row, Col, Typography} from "antd";
import Config from "../../Config";
import type {Point} from "../../Types/api.tsx";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleMapsCoordinatePickerProps {
  value?: Point;
  onChange?: (value?: Point) => void;
  height?: number;
  overlayImageUrl?: string;
  center?: Point;
  bounds?: {
    topLeft?: Point;
    bottomRight?: Point;
  };
}

const GOOGLE_MAP_SCRIPT_ID = "google-maps-js-sdk";
const GOOGLE_MAP_ID = "6552cc943eb9a0ff948d4665";
let googleMapsLoadPromise: Promise<void> | null = null;

const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAP_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), {once: true});
      existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps")), {once: true});
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAP_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};

const GoogleMapsCoordinatePicker = ({value, onChange, height = 280, overlayImageUrl, center, bounds}: GoogleMapsCoordinatePickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const listenersRef = useRef<any[]>([]);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [selectedCoordinate, setSelectedCoordinate] = useState<Point | undefined>(value);

  const apiKey = useMemo(() => import.meta.env.VITE_MAPS_KEY || Config.google.apiKey, []);
  const defaultCenter = useMemo<Point>(() => ({lat: -16.9362287, lng: -70.8908487}), []);

  const setCoordinate = (coordinate?: Point, updateParent = true) => {
    setSelectedCoordinate(coordinate);

    if (!mapRef.current) {
      if (updateParent) {
        onChange?.(coordinate);
      }
      return;
    }

    if (!coordinate) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (updateParent) {
        onChange?.(undefined);
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position: coordinate,
        draggable: true,
      });

      const dragListener = markerRef.current.addListener("dragend", (event: any) => {
        const nextCoordinate = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setSelectedCoordinate(nextCoordinate);
        onChange?.(nextCoordinate);
      });
      listenersRef.current.push(dragListener);
    } else {
      markerRef.current.setPosition(coordinate);
    }

    mapRef.current.panTo(coordinate);

    if (updateParent) {
      onChange?.(coordinate);
    }
  };

  const fitToBounds = () => {
    const topLeft = bounds?.topLeft;
    const bottomRight = bounds?.bottomRight;
    if (!mapRef.current || !window.google?.maps || !topLeft || !bottomRight) {
      return;
    }

    const googleBounds = new window.google.maps.LatLngBounds(
      {
        lat: Math.min(topLeft.lat, bottomRight.lat),
        lng: Math.min(topLeft.lng, bottomRight.lng),
      },
      {
        lat: Math.max(topLeft.lat, bottomRight.lat),
        lng: Math.max(topLeft.lng, bottomRight.lng),
      }
    );
    mapRef.current.fitBounds(googleBounds);
  };

  const syncOverlay = () => {
    if (!mapRef.current || !window.google?.maps) {
      return;
    }

    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    const topLeft = bounds?.topLeft;
    const bottomRight = bounds?.bottomRight;
    if (!overlayImageUrl || !topLeft || !bottomRight) {
      return;
    }

    const overlayBounds = new window.google.maps.LatLngBounds(
      {
        lat: Math.min(topLeft.lat, bottomRight.lat),
        lng: Math.min(topLeft.lng, bottomRight.lng),
      },
      {
        lat: Math.max(topLeft.lat, bottomRight.lat),
        lng: Math.max(topLeft.lng, bottomRight.lng),
      }
    );

    overlayRef.current = new window.google.maps.GroundOverlay(overlayImageUrl, overlayBounds, {
      clickable: false,
      opacity: 0.6,
    });
    overlayRef.current.setMap(mapRef.current);
  };

  useEffect(() => {
    if (!apiKey) {
      setError("No se encontró la API key de Google Maps.");
      return;
    }

    let isMounted = true;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.google?.maps) {
          return;
        }

        const hasBounds = Boolean(bounds?.topLeft && bounds?.bottomRight);
        const initialCenter = value || (hasBounds ? {
          lat: ((bounds?.topLeft?.lat || 0) + (bounds?.bottomRight?.lat || 0)) / 2,
          lng: ((bounds?.topLeft?.lng || 0) + (bounds?.bottomRight?.lng || 0)) / 2,
        } : defaultCenter);
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: value ? 15 : 6,
          mapId: GOOGLE_MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;

        const clickListener = map.addListener("click", (event: any) => {
          const coordinate = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          setCoordinate(coordinate);
        });
        listenersRef.current.push(clickListener);

        if (value) {
          setCoordinate(value, false);
        } else {
          fitToBounds();
        }
        syncOverlay();

        setReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setError("No se pudo cargar Google Maps.");
        }
      });

    return () => {
      isMounted = false;
      listenersRef.current.forEach((listener) => listener?.remove?.());
      listenersRef.current = [];
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [apiKey, defaultCenter]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!value) {
      setCoordinate(undefined, false);
      return;
    }

    if (
      value.lat !== selectedCoordinate?.lat ||
      value.lng !== selectedCoordinate?.lng
    ) {
      setCoordinate(value, false);
    }
  }, [value, ready, selectedCoordinate]);

  useEffect(() => {
    if (!ready || value) {
      return;
    }
    fitToBounds();
  }, [bounds, ready, value]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    syncOverlay();
  }, [overlayImageUrl, bounds, ready]);

  useEffect(() => {
    if (!ready || !center || !mapRef.current) {
      return;
    }

    mapRef.current.panTo(center);
  }, [center, ready]);

  const mapsUrl = selectedCoordinate
    ? `https://www.google.com/maps?q=${selectedCoordinate.lat},${selectedCoordinate.lng}`
    : undefined;

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height,
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 10,
        }}
      />

      <Row gutter={8}>
        <Col span={12}>
          <Input
            value={selectedCoordinate?.lat?.toFixed(6) || ""}
            placeholder="Latitud"
            readOnly
          />
        </Col>
        <Col span={12}>
          <Input
            value={selectedCoordinate?.lng?.toFixed(6) || ""}
            placeholder="Longitud"
            readOnly
          />
        </Col>
      </Row>

      <Row gutter={8} style={{marginTop: 8}}>
        <Col>
          <Button onClick={() => setCoordinate(undefined)} disabled={!selectedCoordinate}>
            Limpiar coordenada
          </Button>
        </Col>
        {mapsUrl && (
          <Col>
            <a href={mapsUrl} target={"_blank"} rel={"noreferrer"}>
              Ver en Google Maps
            </a>
          </Col>
        )}
      </Row>

      {error && (
        <Typography.Text type={"danger"} style={{display: "block", marginTop: 8}}>
          {error}
        </Typography.Text>
      )}
      {!error && !ready && (
        <Typography.Text type={"secondary"} style={{display: "block", marginTop: 8}}>
          Cargando mapa...
        </Typography.Text>
      )}
    </div>
  );
};

export default GoogleMapsCoordinatePicker;
