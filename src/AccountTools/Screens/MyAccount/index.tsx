import {useContext, useState} from 'react';
import {Avatar, Col, Divider, Drawer, Empty, List, Row, Space} from 'antd';
import {PiLock} from 'react-icons/pi';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import UpdateUserPassword from '../../../AccountManagement/Components/UpdateUserPassword';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';

const MyAccount = () => {
  const {user} = useContext(AuthContext);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  return (
    <ModuleContent>
      <Row justify={'center'}>
        <Col md={14}>
          <ContentHeader title={'Mi cuenta'} />
          <Divider style={{margin: '0 0 30px 0'}} dashed orientation={'left'}>
            Seguridad
          </Divider>
          <Space align={'center'} size={'large'}>
            <Avatar size={50}>{user?.profile.name.substring(0, 1)}</Avatar>
            <div>
              <h3>
                {user?.profile.name} {user?.profile.last_name}
              </h3>
              <span>{user?.profile.email}</span>
            </div>
            <div>
              <PrimaryButton
                icon={<PiLock size={16} />}
                onClick={() => setOpenPasswordModal(true)}
                ghost
                size={'small'}
                label={'Actualizar contraseña'}
              />
            </div>
          </Space>
          <h3 style={{marginTop: '20px'}}>Sesiones</h3>
          <List size={'small'} bordered>
            <List.Item actions={['Actual', 'Escritorio']}>Sesión actual</List.Item>
          </List>
          <Divider style={{margin: '30px 0'}} dashed orientation={'left'}>
            Información personal
          </Divider>
          <Row gutter={[20, 20]}>
            <Col md={8}>
              <small>Nombre</small> <br />
              {user?.profile.name}
            </Col>
            <Col md={8}>
              <small>Apellidos</small> <br />
              {user?.profile.last_name}
            </Col>
            <Col md={8}>
              <small>Correo personal</small> <br />
              {user?.profile.personal_email}
            </Col>
            <Col md={8}>
              <small>Teléfono</small> <br />
              {user?.profile.phone}
            </Col>
            <Col md={8}>
              <small>Documento</small> <br />
              <ProfileDocument profile={user?.profile} />
            </Col>
            <Col md={8}>
              <small>Dirección</small> <br />
              {user?.profile.address || 'Sin dirección'}
            </Col>
          </Row>
          <Divider style={{margin: '50px 0 30px 0'}} dashed orientation={'left'}>
            Contratos
          </Divider>
          <Empty description={'Nada por aquí'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      </Row>
      <Drawer
        destroyOnClose
        title={'Actualizar mi contraseña'}
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}>
        {user?.profile && (
          <UpdateUserPassword
            onChange={() => {
              setOpenPasswordModal(false);
            }}
            profile={user?.profile}
          />
        )}
      </Drawer>
    </ModuleContent>
  );
};

export default MyAccount;
