import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Spin, Result, Button } from 'antd';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // extrae los parametros de la url
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const profileUuid = searchParams.get('profile_uuid');

    console.log("Token recibido:", token);
    console.log("Profile UUID recibido:", profileUuid);

    if (token && profileUuid) {
      Cookies.set('session_token', token);
      Cookies.set('profile_uuid', profileUuid);

      // redigir al dashboard
      window.location.href = '/';
    } else {
      // Si los parámetros no están en la URL, mostrar un error
      setError('Faltan parámetros en la URL');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#666' }}>Completando autenticación con Google...</p>
            </div>
    );
  }

  if (error) {
    return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <Result
                      status="error"
                      title="Error de Autenticación"
                      subTitle={error}
                      extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/auth/login')}>
                          Volver al Login
                        </Button>
                      ]}
              />
            </div>
    );
  }

  return null;
};

export default GoogleCallback;
