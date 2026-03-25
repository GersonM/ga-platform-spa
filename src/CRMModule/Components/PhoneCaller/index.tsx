import React, {useEffect, useRef, useState} from 'react';
import {Tooltip} from 'antd';
import {TbPhone, TbPhoneOff} from 'react-icons/tb';
import type {Profile} from "../../../Types/api.tsx";
import './styles.less';

interface PhoneCallerProps {
  profile: Profile;
  fromNumber?: string;
  onCall?: () => void;
  onEndCall?: (durationSeconds: number, transcription: string) => void;
}

const MOCK_TRANSCRIPTIONS = [
  `Agente: Buen día, habla con soporte de GeekAdvice. ¿Con quién tengo el gusto?\nCliente: Hola, soy {name}. Llamo porque tengo una consulta sobre mi cuenta.\nAgente: Claro, con gusto lo ayudo. ¿Me puede indicar su número de documento?\nCliente: Sí, es el 28.741.032.\nAgente: Perfecto. ¿En qué lo puedo ayudar hoy?\nCliente: Quería consultar el estado de mi último pedido.\nAgente: Entiendo. Le confirmo que su pedido está en proceso de envío y debería recibirlo en 2 días hábiles.\nCliente: Muchas gracias, era todo.\nAgente: A usted. Que tenga buen día.`,
  `Agente: Buenas tardes, GeekAdvice. ¿Cómo le puedo ayudar?\nCliente: Hola, soy {name}. Necesito actualizar mis datos de contacto.\nAgente: Perfecto, ¿qué datos desea actualizar?\nCliente: Mi dirección de correo y teléfono.\nAgente: Anotado. ¿Me dicta el nuevo correo, por favor?\nCliente: Es contacto@ejemplo.com.\nAgente: Confirmado. ¿Y el nuevo teléfono?\nCliente: +54 9 11 5544-3322.\nAgente: Listo, los datos han sido actualizados. ¿Hay algo más en que pueda ayudarle?\nCliente: No, era todo. Muchas gracias.\nAgente: De nada. Hasta luego.`,
  `Agente: Buen día, ¿con quién hablo?\nCliente: Con {name}. Tengo un problema con una factura.\nAgente: Lamento escuchar eso. ¿Me puede dar el número de factura?\nCliente: Es la FA-00234.\nAgente: Un momento mientras la busco en el sistema… La veo aquí. El importe es de $12.500. ¿Cuál es el inconveniente?\nCliente: Figura un cargo que no reconozco.\nAgente: Entiendo. Voy a escalar esto al área de facturación para que lo revisen con detalle. Le llegará un correo con la resolución en 48 horas hábiles.\nCliente: Está bien, muchas gracias.\nAgente: A usted. Buen día.`,
];

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const PhoneCaller = ({profile, fromNumber = '+54 11 4823-7600', onCall, onEndCall}: PhoneCallerProps) => {
  const [calling, setCalling] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  useEffect(() => {
    if (calling) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          durationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDuration(0);
      durationRef.current = 0;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calling]);

  if (!profile.phone) return null;

  const handleCall = () => {
    setCalling(true);
    onCall?.();
  };

  const handleEndCall = () => {
    const seconds = durationRef.current;
    const transcription = MOCK_TRANSCRIPTIONS[
      Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)
    ].replace(/\{name\}/g, profile.name);
    setCalling(false);
    onEndCall?.(seconds, transcription);
  };

  return (
    <div className="phone-caller">
      {calling ? (
        <div className="active-call-card">
          <span className="call-status-dot" />
          <div className="call-contact">
            <span className="call-contact-name">{profile.name}</span>
            <span className="call-duration">{formatDuration(duration)}</span>
          </div>
          <div className="call-from">
            <span className="call-from-label">Desde</span>
            <span className="call-from-number">{fromNumber}</span>
          </div>
          <Tooltip title="Colgar" placement="bottom">
            <button className="hangup-btn" onClick={handleEndCall}>
              <TbPhoneOff />
            </button>
          </Tooltip>
        </div>
      ) : (
        <button className="call-trigger" onClick={handleCall}>
          <span className="call-trigger-icon">
            <TbPhone />
          </span>
          <span className="call-trigger-info">
            <div className="call-trigger-label">{profile.name}</div>
            <div className="call-trigger-number">{profile.phone}</div>
          </span>
          <span className="call-trigger-from">
            <div className="call-trigger-from-label">Desde</div>
            <div className="call-trigger-from-number">{fromNumber}</div>
          </span>
        </button>
      )}
    </div>
  );
};

export default PhoneCaller;
