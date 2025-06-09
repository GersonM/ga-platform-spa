import {useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Col, Row} from 'antd';

const EstateDetailView = () => {
  const [loading, _setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  return (
    <ModuleContent>
      <ContentHeader title={'Propiedad'} loading={loading} showBack onRefresh={() => setReload(!reload)} />
      <div>
        <Row>
          <Col md={12}>
            <h3>Detalles</h3>
          </Col>
          <Col md={12}>
            <h3>Documentación</h3>
          </Col>
        </Row>
      </div>
    </ModuleContent>
  );
};

export default EstateDetailView;
