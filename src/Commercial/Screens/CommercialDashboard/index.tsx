import React, {useContext, useEffect, useState} from 'react';
import {Card, Col, Divider, Progress, Row, Select, Space, Tooltip} from 'antd';
import {AxisOptions, Chart} from 'react-charts';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import AuthContext from '../../../Context/AuthContext';
import MoneyString from '../../../CommonUI/MoneyString';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

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

  if (!commercialStats) return <LoadingIndicator message="Cargando datos" />;

  const data: any[] = [
    {
      label: 'Entregas por fecha',
      data: commercialStats.provisioning.dates,
    },
  ];

  const salesDataMonthly: any[] = [
    {
      label: 'Ventas por mes',
      data: commercialStats.sales.monthly,
    },
  ];

  const salesDataDaily: any[] = [
    {
      label: 'Ventas por día',
      data: commercialStats.sales.daily,
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Dashboard'} onRefresh={() => setReload(!reload)} loading={loading} />
      <Card
        bordered={false}
        extra={
          <>
            <Select
              placeholder={'2024'}
              style={{width: 90}}
              options={[
                {label: '2024', value: '2024'},
                {label: '2023', value: '2023'},
                {label: '2022', value: '2022'},
              ]}
            />
          </>
        }
        title={'Ventas'}
        loading={loading}>
        <Row gutter={[20, 20]}>
          <Col md={12}>
            <Space>
              <h3>Ventas por año</h3>
            </Space>
            <div style={{height: 250}}>
              <Chart
                options={{
                  dark: darkMode,
                  data: salesDataMonthly,
                  primaryAxis: primaryAxisDate,
                  secondaryAxes: secondaryAxesDate,
                }}
              />
            </div>
          </Col>
          <Col md={12}>
            <h3>Ventas del mes actual</h3>
            <div style={{height: 250}}>
              <Chart
                options={{
                  dark: darkMode,
                  data: salesDataDaily,
                  primaryAxis: primaryAxisDate,
                  secondaryAxes: secondaryAxesDate,
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
      <Card bordered={false} title={'Pagos'} style={{marginTop: 50}}>
        <Row gutter={[20, 20]}>
          {commercialStats.financial.groups.map(g => {
            return (
              <Col>
                <h2>{g.label}</h2>
                <p>
                  Vendido: <MoneyString value={g.total} /> <br />
                  Cobrado: <MoneyString value={g.paid} />
                </p>
                <div>
                  <Progress type={'dashboard'} percent={Math.round((g.paid * 100) / g.total)} />
                </div>
              </Col>
            );
          })}

          <Col>
            <h2>Total</h2>
            <p>
              Total vendido: <MoneyString value={commercialStats.financial.total} /> <br />
              Cobrado: <MoneyString value={commercialStats.financial.paid} />
            </p>
            <div>
              <Progress
                type={'dashboard'}
                percent={Math.round((commercialStats.financial.paid * 100) / commercialStats.financial.total)}
              />
            </div>
          </Col>
          <Col md={12}>
            <div style={{height: 250}}>
              <Chart
                options={{
                  dark: darkMode,
                  data: [
                    {
                      label: 'Pagos por mes',
                      data: commercialStats.financial.monthly,
                    },
                  ],
                  primaryAxis: primaryAxisDate,
                  secondaryAxes: secondaryAxesDate,
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>

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
