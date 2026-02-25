import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Col, Input, Row, Typography} from "antd";
import Config from "../../Config";

declare global {
  interface Window {
    google?: any;
  }
}

type Point = {
  lat: number;
  lng: number;
};

interface GoogleMapsBoundsPickerProps {
  value?: {
    topLeft?: Point;
    bottomRight?: Point;
  };
  onChange?: (value?: {topLeft?: Point; bottomRight?: Point}) => void;
  height?: number;
  overlayImageUrl?: string;
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

const GoogleMapsBoundsPicker = ({value, onChange, height = 320, overlayImageUrl}: GoogleMapsBoundsPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const listenersRef = useRef<any[]>([]);
  const topLeftMarkerRef = useRef<any>(null);
  const bottomRightMarkerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const activePointRef = useRef<"topLeft" | "bottomRight">("topLeft");
  const boundsRef = useRef<{topLeft?: Point; bottomRight?: Point}>(value || {});

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [activePoint, setActivePoint] = useState<"topLeft" | "bottomRight">("topLeft");
  const [bounds, setBounds] = useState<{topLeft?: Point; bottomRight?: Point}>(value || {});

  const apiKey = useMemo(() => import.meta.env.VITE_MAPS_KEY || Config.google.apiKey, []);
  const defaultCenter = useMemo(() => ({lat: -12.0464, lng: -77.0428}), []);

  useEffect(() => {
    activePointRef.current = activePoint;
  }, [activePoint]);

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  const setMarker = (pointType: "topLeft" | "bottomRight", point?: Point) => {
    if (!mapRef.current || !window.google?.maps) {
      return;
    }

    const markerRef = pointType === "topLeft" ? topLeftMarkerRef : bottomRightMarkerRef;
    const label = pointType === "topLeft" ? "TL" : "BR";

    if (!point) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      return;
    }

    const position = {lat: point.lat, lng: point.lng};
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position,
        label,
        draggable: true,
      });

      const dragListener = markerRef.current.addListener("dragend", (event: any) => {
        const draggedPoint = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        const nextBounds = pointType === "topLeft"
          ? {...boundsRef.current, topLeft: draggedPoint}
          : {...boundsRef.current, bottomRight: draggedPoint};
        boundsRef.current = nextBounds;
        setBounds(nextBounds);
        syncOverlay(nextBounds, overlayImageUrl);
        onChange?.(nextBounds);
      });
      listenersRef.current.push(dragListener);
    } else {
      markerRef.current.setPosition(position);
    }
  };

  const fitMapToPoints = (nextBounds: {topLeft?: Point; bottomRight?: Point}) => {
    if (!mapRef.current || !window.google?.maps) {
      return;
    }

    if (nextBounds.topLeft && nextBounds.bottomRight) {
      const googleBounds = new window.google.maps.LatLngBounds(
        {
          lat: Math.min(nextBounds.topLeft.lat, nextBounds.bottomRight.lat),
          lng: Math.min(nextBounds.topLeft.lng, nextBounds.bottomRight.lng),
        },
        {
          lat: Math.max(nextBounds.topLeft.lat, nextBounds.bottomRight.lat),
          lng: Math.max(nextBounds.topLeft.lng, nextBounds.bottomRight.lng),
        }
      );
      mapRef.current.fitBounds(googleBounds);
      return;
    }

    const singlePoint = nextBounds.topLeft || nextBounds.bottomRight;
    if (singlePoint) {
      mapRef.current.setCenter({lat: singlePoint.lat, lng: singlePoint.lng});
      mapRef.current.setZoom(15);
    }
  };

  const syncOverlay = (nextBounds: {topLeft?: Point; bottomRight?: Point}, imageUrl?: string) => {
    if (!mapRef.current || !window.google?.maps) {
      return;
    }

    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    if (!imageUrl || !nextBounds.topLeft || !nextBounds.bottomRight) {
      return;
    }

    const overlayBounds = new window.google.maps.LatLngBounds(
      {
        lat: Math.min(nextBounds.topLeft.lat, nextBounds.bottomRight.lat),
        lng: Math.min(nextBounds.topLeft.lng, nextBounds.bottomRight.lng),
      },
      {
        lat: Math.max(nextBounds.topLeft.lat, nextBounds.bottomRight.lat),
        lng: Math.max(nextBounds.topLeft.lng, nextBounds.bottomRight.lng),
      }
    );

    overlayRef.current = new window.google.maps.GroundOverlay(imageUrl, overlayBounds, {
      clickable: false,
      opacity: 0.6,
    });
    overlayRef.current.setMap(mapRef.current);
  };

  const setPoint = (pointType: "topLeft" | "bottomRight", point?: Point) => {
    const nextBounds = pointType === "topLeft"
      ? {...boundsRef.current, topLeft: point}
      : {...boundsRef.current, bottomRight: point};
    boundsRef.current = nextBounds;
    setBounds(nextBounds);
    onChange?.(nextBounds);
    setMarker(pointType, point);
    syncOverlay(nextBounds, overlayImageUrl);
    fitMapToPoints(nextBounds);
  };

  useEffect(() => {
    if (!apiKey) {
      setError("No se encontró la API key de Google Maps.");
      return;
    }

    let isMounted = true;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!isMounted || !window.google?.maps || !mapContainerRef.current) {
          return;
        }

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 6,
          mapId: GOOGLE_MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;

        const clickListener = map.addListener("click", (event: any) => {
          const point = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          setPoint(activePointRef.current, point);
        });
        listenersRef.current.push(clickListener);

        if (value?.topLeft) {
          setMarker("topLeft", value.topLeft);
        }
        if (value?.bottomRight) {
          setMarker("bottomRight", value.bottomRight);
        }
        syncOverlay(value || {}, overlayImageUrl);
        fitMapToPoints(value || {});
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

    const nextBounds = value || {};
    boundsRef.current = nextBounds;
    setBounds(nextBounds);
    setMarker("topLeft", nextBounds.topLeft);
    setMarker("bottomRight", nextBounds.bottomRight);
    syncOverlay(nextBounds, overlayImageUrl);
    fitMapToPoints(nextBounds);
  }, [value, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    syncOverlay(boundsRef.current || {}, overlayImageUrl);
  }, [overlayImageUrl, ready]);

  return (
    <div>
      <Row gutter={8} style={{marginBottom: 8}}>
        <Col>
          <Button
            type={activePoint === "topLeft" ? "primary" : "default"}
            onClick={() => setActivePoint("topLeft")}>
            Marcar top left
          </Button>
        </Col>
        <Col>
          <Button
            type={activePoint === "bottomRight" ? "primary" : "default"}
            onClick={() => setActivePoint("bottomRight")}>
            Marcar bottom right
          </Button>
        </Col>
      </Row>

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

      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Input value={bounds.topLeft?.lat?.toFixed(6) || ""} placeholder={"top_left.lat"} readOnly />
        </Col>
        <Col span={12}>
          <Input value={bounds.topLeft?.lng?.toFixed(6) || ""} placeholder={"top_left.lng"} readOnly />
        </Col>
        <Col span={12}>
          <Input value={bounds.bottomRight?.lat?.toFixed(6) || ""} placeholder={"bottom_right.lat"} readOnly />
        </Col>
        <Col span={12}>
          <Input value={bounds.bottomRight?.lng?.toFixed(6) || ""} placeholder={"bottom_right.lng"} readOnly />
        </Col>
      </Row>

      <Row gutter={8} style={{marginTop: 8}}>
        <Col>
          <Button onClick={() => setPoint("topLeft", undefined)} disabled={!bounds.topLeft}>
            Limpiar top left
          </Button>
        </Col>
        <Col>
          <Button onClick={() => setPoint("bottomRight", undefined)} disabled={!bounds.bottomRight}>
            Limpiar bottom right
          </Button>
        </Col>
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

export default GoogleMapsBoundsPicker;
