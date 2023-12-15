import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Drawer, Form, Input, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

import {Profile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileCard from '../ProfileCard';
import UpdateUserPassword from '../UpdateUserPassword';

interface ProfileEditorProps {
  profileUuid: string;
  onCompleted?: () => void;
}

const ProfileEditor = ({profileUuid, onCompleted}: ProfileEditorProps) => {
  const [profile, setProfile] = useState<Profile>();
  const [loading, setLoading] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
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
  }, [params.uuid]);

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
          const value = response.data.birthday ? dayjs(response.data.birthday) : null;
          setProfile({...response.data, birthday: value});
          setProfile(response.data);
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

  if (!profile) return null;
  return (
    <>
      <Row align={'middle'} justify={'center'}>
        <Col>
          <ProfileCard profile={profile} />
          <Form form={form} initialValues={profile} layout={'vertical'} onFinish={onSubmit}>
            <Row gutter={15}>
              <Col>
                <Form.Item name={'name'} label={'Nombre'}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name={'last_name'} label={'Apellidos'}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name={'email'} label={'Email'}>
              <Input />
            </Form.Item>
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
              <Col>
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
              <Col>
                <Form.Item name={'birthday'} label={'Fecha de nacimiento'}>
                  <DatePicker />
                </Form.Item>
              </Col>
            </Row>
            <Button block htmlType={'submit'} type={'primary'} loading={loading}>
              Guardar
            </Button>
            <br />
            <br />
            <Button block type={'text'} onClick={() => setOpenChangePassword(true)}>
              Actualizar contraseña
            </Button>
          </Form>
        </Col>
      </Row>
      <Drawer
        destroyOnClose
        open={openChangePassword}
        title={'Actualizar contraseña para ' + profile.name}
        onClose={() => setOpenChangePassword(false)}>
        {profile.user && (
          <UpdateUserPassword
            onChange={() => {
              setOpenChangePassword(false);
            }}
            user={profile.user}
          />
        )}
      </Drawer>
    </>
  );
};

export default ProfileEditor;
