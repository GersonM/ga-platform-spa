import {useEffect, useState} from 'react';
import {Card, Col, Progress, Row, Select, Statistic, Tag} from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import {TbCalendarUp, TbClockUp, TbUsers} from "react-icons/tb";

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from "../../../CommonUI/TableList";

interface AttendanceStats {
  today: {
    total_attendances: number;
    total_entries: number;
    total_exits: number;
    unique_visitors: number;
  };
  this_month: {
    total_attendances: number;
    unique_visitors: number;
    total_entries: number;
    total_exits: number;
  };
  this_year: {
    total_attendances: number;
    unique_visitors: number;
    total_entries: number;
    total_exits: number;
  };
}

interface MonthlyData {
  month: string;
  total: number;
  entries: number;
  exits: number;
}

interface DailyData {
  day: number;
  total: number;
  entries: number;
}

interface TopUser {
  name: string;
  total_attendances: number;
  entries: number;
  exits: number;
}

interface PopularHour {
  hour: string;
  total: number;
}

interface DashboardData {
  general_stats: AttendanceStats;
  monthly_attendance: MonthlyData[];
  daily_attendance: DailyData[];
  top_users: TopUser[];
  summary: {
    today_total: number;
    today_entries: number;
    today_visitors: number;
    month_total: number;
    month_visitors: number;
    most_popular_hour: PopularHour;
    busiest_day: { day: string; total: number };
  };
  current_year: string;
}

const AttendanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`club/attendance-dashboard?year=${selectedYear}`, config)
      .then(response => {
        if (response) {
          setDashboardData(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, selectedYear]);

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    return new Intl.NumberFormat('es-PE').format(num);
  };

  const calculatePercentage = (current: number, total: number): number => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const yearOptions = Array.from({length: 3}, (_, i) => {
    const year = new Date().getFullYear() - i;
    return {label: year.toString(), value: year};
  });

  return (
    <ModuleContent>
      <ContentHeader
        title="Estadisticas de asistencia"
        onRefresh={() => setReload(!reload)}
        loading={loading}
        tools={
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            style={{width: 120}}
          />
        }
      />
      <p>Aquí tienes un resumen de las asistencias y actividad</p>
      <div className={'grid-layout-fit'}>
        <Card>
          <Statistic prefix={<TbUsers/>} title={'Hoy'} value={formatNumber(dashboardData?.summary?.today_total)}/>
          <div>{formatNumber(dashboardData?.summary.today_visitors)} visitantes</div>
        </Card>
        <Card>
          <Statistic prefix={<TbUsers/>} title={'Este mes'} value={formatNumber(dashboardData?.summary.month_total)}/>
          <div>{formatNumber(dashboardData?.summary.month_visitors)} visitantes únicos</div>
        </Card>
        <Card>
          <Statistic prefix={<TbClockUp/>} title={'Hora popular'}
                     value={dashboardData?.summary.most_popular_hour?.hour || 'N/A'}/>
          <div>{formatNumber(dashboardData?.summary.most_popular_hour?.total || 0)} registros</div>
        </Card>
        <Card>
          <Statistic prefix={<TbCalendarUp/>} title={'Días más activo'}
                     value={dashboardData?.summary.busiest_day?.day || 'N/A'}/>
          <div>{formatNumber(dashboardData?.summary.busiest_day?.total || 0)} registros</div>
        </Card>
        <Card>
          <Statistic prefix={<TbUsers/>} title={'Este año'}
                     value={formatNumber(dashboardData?.general_stats.this_year.total_attendances)}/>
          <div>{formatNumber(dashboardData?.general_stats.this_year.unique_visitors)} visitantes</div>
        </Card>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={12}>
          <Card title={`Asistencias por Mes - ${selectedYear}`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.monthly_attendance}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip formatter={(value) => formatNumber(value as number)}/>
                <Legend/>
                <Bar dataKey="total" fill="#0088FE" name="Personas"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={12}>
          <Card title="Asistencia diaria">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.daily_attendance}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="day"/>
                <YAxis/>
                <Tooltip formatter={(value) => formatNumber(value as number)}/>
                <Legend/>
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0088FE"
                  name="Total"
                  strokeWidth={3}
                  dot={{fill: '#0088FE', strokeWidth: 2, r: 4}}
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#00C49F"
                  name="Entradas"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Top 10 usuarios con más asistencias (Últimos 30 días)">
            <TableList
              columns={[
                {
                  title: 'Pos.', dataIndex: 'name',
                  width: 70,
                  render: (_name: string, _row: any, index: number) => <Tag color={COLORS[index % COLORS.length]}>
                    {index + 1}
                  </Tag>
                },
                {title: 'Nombre', dataIndex: 'name'},
                {title: 'Total', dataIndex: 'total_attendances'},
                {
                  title: 'Indice de asistencia', dataIndex: 'total_attendances',
                  render: (total_attendances: number, _row: any, index: number) => {
                    const percentage = calculatePercentage(total_attendances, 30);
                    return <Progress strokeColor={COLORS[index % COLORS.length]} percent={percentage}/>
                  }
                },
              ]}
              dataSource={dashboardData?.top_users}
            />
          </Card>
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default AttendanceDashboard;
