import React, {useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {AxisOptions, Chart} from 'react-charts';
import {Col, Row} from 'antd';

const RealEstateDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const data: any[] = [
    {
      label: 'React Charts',
      data: [
        {
          date: '18/11/2024',
          stars: 12,
        },
        {
          date: '19/11/2024',
          stars: 10,
        },
        {
          date: '20/11/2024',
          stars: 120,
        },
        {
          date: '21/11/2024',
          stars: 140,
        },
        // ...
      ],
    },
  ];

  const primaryAxis = React.useMemo(
    (): AxisOptions<any> => ({
      getValue: datum => datum.date,
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<any>[] => [
      {
        min: 0,
        getValue: datum => datum.stars,
      },
    ],
    [],
  );

  return (
    <ModuleContent>
      <ContentHeader title={'Dashboard'} onRefresh={() => setReload(!reload)} loading={loading} />
      <Row gutter={[20, 20]}>
        <Col md={12}>
          <h3>Ventas por etapa</h3>
          <div style={{height: 200}}>
            <Chart
              options={{
                data,
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
              primaryAxis,
              secondaryAxes,
            }}
          />
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default RealEstateDashboard;
