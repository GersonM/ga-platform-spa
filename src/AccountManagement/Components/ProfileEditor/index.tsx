import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, DatePicker, Divider, Drawer, Form, Input, Popconfirm, Row, Select, Space} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {useParams} from 'react-router-dom';
import {CheckIcon, HandThumbUpIcon, LockClosedIcon, NoSymbolIcon, ShieldCheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';
import dayjs from 'dayjs';

import {Profile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileCard from '../ProfileCard';
import UpdateUserPassword from '../UpdateUserPassword';
import UserPermissionsManager from '../UserPermissionsManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {TrashIcon} from '@heroicons/react/24/outline';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import AlertMessage from '../../../CommonUI/AlertMessage';

interface ProfileEditorProps {
  profileUuid: string;
  onCompleted?: () => void;
}

const ProfileEditor = ({profileUuid, onCompleted}: ProfileEditorProps) => {
  const [profile, setProfile] = useState<Profile>();
  const [loading, setLoading] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openPermissionsManager, setOpenPermissionsManager] = useState(false);
  const [reload, setReload] = useState(false);
  const params = useParams();
  const [form] = useForm();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`hr-management/profiles/${profileUuid}`, config)
      .then(response => {
        if (response) {
          const value = response.data.birthday ? dayjs(response.data.birthday) : null;
          setProfile({...response.data, birthday: value});
          console.log(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [params.uuid, reload]);

  useEffect(() => {
    if (profile) {
      form.resetFields();
      const value = profile.birthday ? dayjs(profile.birthday) : null;
      form.setFieldValue('birthday', value);
    }
  }, [profile]);

  const onSubmit = (values: any) => {
    setLoading(true);
    axios
      .put(`hr-management/profiles/${profileUuid}`, values)
      .then(response => {
        if (response) {
          setLoading(false);
          //const value = response.data.birthday ? dayjs(response.data.birthday) : null;
          setProfile(response.data);
          setReload(!reload);
          if (onCompleted) {
            onCompleted();
          }
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const terminateAccount = () => {
    setLoading(true);
    axios
      .post(`authentication/users/${profile?.user?.uuid}/disable`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const enableAccount = () => {
    setLoading(true);
    axios
      .post(`authentication/users/${profile?.user?.uuid}/enable`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  if (!profile) return null;

  return (
    <>
      <LoadingIndicator visible={loading} message={'Guardando...'} />
      <Row gutter={30}>
        <Col md={6}>
          <ProfileCard profile={profile} />
          <Space.Compact block direction={'vertical'}>
            <PrimaryButton
              icon={<LockClosedIcon width={20} />}
              label={'Actualizar contraseña'}
              onClick={() => setOpenChangePassword(true)}
            />
            <PrimaryButton
              icon={<ShieldCheckIcon />}
              label={'Ver permisos'}
              onClick={() => setOpenPermissionsManager(true)}
            />
            {profile.user?.disabled_at ? (
              <PrimaryButton icon={<HandThumbUpIcon />} label={'Habilitar usuario'} onClick={enableAccount} />
            ) : (
              <Popconfirm
                title={'Bloquear usuario'}
                cancelText={'Cancelar'}
                okText={'Bloquear'}
                onConfirm={terminateAccount}
                description={
                  <>
                    El bloquear al usuario, se cerraran todas las sesiones <br />
                    activas y no podrá iniciar sesión
                  </>
                }>
                <PrimaryButton danger icon={<NoSymbolIcon />} label={'Bloquear usuario'} />
              </Popconfirm>
            )}
            <Popconfirm
              title={'Eliminar usuario'}
              cancelText={'Cancelar'}
              okText={'Eliminar'}
              description={
                <>
                  Esta acción es irreversible y borrará toda la información <br /> relacionada con este usuario
                </>
              }>
              <PrimaryButton danger icon={<TrashIcon />} label={'Eliminar cuenta'} />
            </Popconfirm>
          </Space.Compact>
          {profile.user?.disabled_at && (
            <AlertMessage message={'Este usuario está bloqueado y no podrá iniciar sesión'} />
          )}
        </Col>
        <Col md={13}>
          <Form form={form} initialValues={profile} layout={'vertical'} onFinish={onSubmit}>
            <Row gutter={15}>
              <Col md={12}>
                <Form.Item name={'name'} label={'Nombre'}>
                  <Input />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item name={'last_name'} label={'Apellidos'}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col md={12}>
                <Form.Item name={'email'} label={'Email'}>
                  <Input />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item name={'phone'} label={'Teléfono'}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col md={10}>
                <Form.Item name={'doc_type'} label={'Tipo de documento'}>
                  <Select
                    placeholder={'Elige'}
                    options={[
                      {label: 'DNI', value: 'dni'},
                      {label: 'CE', value: 'ce'},
                      {label: 'Pasaporte', value: 'passport'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={14}>
                <Form.Item name={'doc_number'} label={'N° Documento'}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name={'address'} label={'Dirección'}>
              <Input />
            </Form.Item>
            <Row gutter={15}>
              <Col md={8}>
                <Form.Item name={'fk_country_uuid'} label={'País de nacimiento'}>
                  <Select
                    aria-autocomplete={'none'}
                    showSearch
                    placeholder={'Buscar país'}
                    options={[
                      {label: 'Brasil', value: 'passport'},
                      {label: 'Ecuador', value: 'passport'},
                      {label: 'Chile', value: 'passport'},
                      {label: 'Perú', value: 'dni'},
                      {label: 'Venezuela', value: 'ce'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={8}>
                <Form.Item name={'gender'} label={'Género'}>
                  <Select
                    aria-autocomplete={'none'}
                    showSearch
                    placeholder={'No definido'}
                    options={[
                      {label: 'Masculino', value: 'M'},
                      {label: 'Femenino', value: 'F'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={8}>
                <Form.Item name={'birthday'} label={'Fecha de nacimiento'}>
                  <DatePicker style={{width: '100%'}} />
                </Form.Item>
              </Col>
            </Row>
            <Divider>Autenticación</Divider>
            <Row gutter={15}>
              <Col md={12}>
                <Form.Item name={'login_method'} label={'Método de inicio de sesión'}>
                  <Select
                    aria-autocomplete={'none'}
                    showSearch
                    placeholder={'Todos'}
                    options={[
                      {label: 'cPanel / Webmail', value: 'cpanel'},
                      {label: 'Gmail', value: 'gmail'},
                      {label: 'Todos', value: 'any'},
                      {label: 'Restringido', value: 'none'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item name={'user_email'} label={'E-mail de login'}>
                  {profile.user?.email}
                </Form.Item>
              </Col>
            </Row>
            <PrimaryButton block htmlType={'submit'} icon={<CheckIcon />} loading={loading} label={'Guardar'} />
          </Form>
        </Col>
      </Row>
      <Drawer
        destroyOnClose
        open={openChangePassword}
        title={'Actualizar contraseña para ' + profile.name}
        onClose={() => setOpenChangePassword(false)}>
        {profile && (
          <UpdateUserPassword
            onChange={() => {
              setOpenChangePassword(false);
            }}
            profile={profile}
          />
        )}
      </Drawer>
      <Drawer
        destroyOnClose
        open={openPermissionsManager}
        title={'Actualizar permisos para ' + profile.name}
        onClose={() => setOpenPermissionsManager(false)}>
        {profile.user && <UserPermissionsManager user={profile.user} onChange={() => setReload(!reload)} />}
      </Drawer>
    </>
  );
};

export default ProfileEditor;
