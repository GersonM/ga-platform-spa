import React, {useEffect, useState} from 'react';
import {Spin, Result, Button} from 'antd';
import {useNavigate, useSearchParams} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // El backend manejará el callback y retornará el token
        const response = await axios.get('authenticate/auth/google/callback', {
          params: Object.fromEntries(searchParams.entries())
        });

        if (response.data && response.data.token) {
          // Guardar el token y redirigir
          axios.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
          Cookies.set('session_token', response.data.token);

          if (response.data.profile_uuid) {
            Cookies.set('profile_uuid', response.data.profile_uuid);
          }

          // Redirigir al dashboard
          window.location.href = '/';
        } else {
          throw new Error('Token no recibido del servidor');
        }
      } catch (err: any) {
        console.error('Error en callback de Google:', err);
        setError(err.response?.data?.message || err.message || 'Error al autenticar con Google');
        setLoading(false);
      }
    };

    // Verificar si hay parámetros en la URL (código de autorización de Google)
    if (searchParams.has('code') || searchParams.has('error')) {
      handleCallback();
    } else {
      setError('Parámetros de callback inválidos');
      setLoading(false);
    }
  }, [searchParams, navigate]);

  if (loading) {
    return (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column'
            }}>
              <Spin size="large" />
              <p style={{marginTop: 16, color: '#666'}}>
                Completando autenticación con Google...
              </p>
            </div>
    );
  }

  if (error) {
    return (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}>
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
