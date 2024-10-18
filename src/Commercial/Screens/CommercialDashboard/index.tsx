import React, {useContext, useEffect, useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Card, Col, Divider, Row} from 'antd';
import {AxisOptions, Chart} from 'react-charts';
import AuthContext from '../../../Context/AuthContext';

const CommercialDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commercialStats, setCommercialStats] = useState<any>();
  const {darkMode} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/stats`, config)
      .then(response => {
        if (response) {
          setCommercialStats(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const primaryAxis = React.useMemo(
    (): AxisOptions<any> => ({
      getValue: datum => datum.label,
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<any>[] => [
      {
        min: 0,
        getValue: datum => datum.total,
        stacked: true,
      },
    ],
    [],
  );

  const primaryAxisDate = React.useMemo(
    (): AxisOptions<any> => ({
      getValue: datum => datum.date,
    }),
    [],
  );

  const secondaryAxesDate = React.useMemo(
    (): AxisOptions<any>[] => [
      {
        min: 0,
        getValue: datum => datum.total,
      },
    ],
    [],
  );

  if (!commercialStats) return null;

  const data: any[] = [
    {
      label: 'Entregas por fecha',
      data: commercialStats.provisioning.dates,
    },
  ];

  const salesData: any[] = [
    {
      label: 'Entregas por fecha',
      data: commercialStats.sales.dates,
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Dashboard'} onRefresh={() => setReload(!reload)} loading={loading} />

      <Row gutter={[20, 20]}>
        <Col md={24}>
          <h1>Ventas</h1>
          <h3>Ventas por mes</h3>
          <div style={{height: 250}}>
            <Chart
              options={{
                dark: darkMode,
                data: salesData,
                primaryAxis: primaryAxisDate,
                secondaryAxes: secondaryAxesDate,
              }}
            />
          </div>
        </Col>
      </Row>
      <Divider />
      <h1>Entregas</h1>
      <Row gutter={[20, 20]}>
        <Col md={24}>
          <h3>Entregas por día</h3>
          <div style={{height: 250}}>
            <Chart
              options={{
                data,
                primaryAxis: primaryAxisDate,
                secondaryAxes: secondaryAxesDate,
              }}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col md={12}>
          <br />
          <br />
          <h3>Entregas por modalidad y etapa</h3>
          <div style={{height: 250}}>
            <Chart
              options={{
                data: commercialStats.provisioning.groups,
                primaryAxis,
                secondaryAxes,
              }}
            />
          </div>
        </Col>
        <Col md={12}></Col>
      </Row>
    </ModuleContent>
  );
};

export default CommercialDashboard;
