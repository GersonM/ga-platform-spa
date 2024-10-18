import React, {useEffect, useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Col, Row} from 'antd';
import {AxisOptions, Chart} from 'react-charts';

const CommercialDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commercialStats, setCommercialStats] = useState<any>();

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
      getValue: datum => 'Techo propio',
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<any>[] => [
      {
        min: 0,
        getValue: datum => 10,
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
        getValue: datum => datum.count,
      },
    ],
    [],
  );

  if (!commercialStats) return null;

  const dataGroups: any[] = [
    {
      label: 'Entregas por modalidad',
      data: Object.keys(commercialStats.provisioning.groups).map(k => {
        return {
          date: k,
          count: commercialStats.provisioning.dates[k],
        };
      }),
    },
  ];

  const data: any[] = [
    {
      label: 'Entregas por fecha',
      data: Object.keys(commercialStats.provisioning.dates).map(k => {
        return {
          date: k,
          count: commercialStats.provisioning.dates[k],
        };
      }),
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Dashboard'} onRefresh={() => setReload(!reload)} loading={loading} />
      <Row gutter={[20, 20]}>
        <Col md={12}>
          <h3>Ventas por etapa</h3>
          <div style={{height: 200}}>
            <Chart
              options={{
                data: dataGroups,
                primaryAxis,
                secondaryAxes,
              }}
            />
          </div>
        </Col>
        <Col md={12}>
          <h3>Entregas por día</h3>
          <Chart
            options={{
              data,
              primaryAxis: primaryAxisDate,
              secondaryAxes: secondaryAxesDate,
            }}
          />
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default CommercialDashboard;
