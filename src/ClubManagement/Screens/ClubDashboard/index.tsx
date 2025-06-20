import React, { useEffect, useState } from 'react';
import { Card, Select, Spin, notification } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';

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

const ClubDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, reload]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`club/attendance-dashboard?year=${selectedYear}`);
      setDashboardData(response.data);
    } catch (error) {
      ErrorHandler.showNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-PE').format(num);
  };

  const calculatePercentage = (current: number, total: number): number => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year };
  });

  if (loading) {
    return (
      <ModuleContent>
        <ContentHeader title="Dashboard del Club" loading={loading} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Cargando dashboard...</p>
        </div>
      </ModuleContent>
    );
  }

  if (!dashboardData) {
    return (
      <ModuleContent>
        <ContentHeader title="Dashboard del Club" />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Error al cargar los datos del dashboard</p>
        </div>
      </ModuleContent>
    );
  }

  const { general_stats, monthly_attendance, daily_attendance, top_users, summary } = dashboardData;

  return (
    <ModuleContent>
      <ContentHeader
        title="Dashboard del Club"
        onRefresh={() => setReload(!reload)}
        loading={loading}
        tools={
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            style={{ width: 120 }}
          />
        }
      />
      <p>Aquí tienes un resumen de las asistencias y actividad del club</p>

      {/* Tarjetas de resumen principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Card title="Hoy" size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
              {formatNumber(summary.today_total)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              <div>↗ {formatNumber(summary.today_entries)} entradas</div>
              <div>👥 {formatNumber(summary.today_visitors)} visitantes</div>
            </div>
          </div>
        </Card>

        <Card title="Este Mes" size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
              {formatNumber(summary.month_total)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              <div>👥 {formatNumber(summary.month_visitors)} visitantes únicos</div>
            </div>
          </div>
        </Card>

        <Card title="Hora Popular" size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14', marginBottom: '8px' }}>
              {summary.most_popular_hour?.hour || 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              <div>📊 {formatNumber(summary.most_popular_hour?.total || 0)} registros</div>
            </div>
          </div>
        </Card>

        <Card title="Día Activo" size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#722ed1', marginBottom: '8px' }}>
              {summary.busiest_day?.day || 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              <div>📈 {formatNumber(summary.busiest_day?.total || 0)} registros</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Asistencias mensuales */}
        <Card title={`Asistencias por Mes - ${selectedYear}`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly_attendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" name="Total" />
              <Bar dataKey="entries" fill="#00C49F" name="Entradas" />
              <Bar dataKey="exits" fill="#FFBB28" name="Salidas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Asistencias diarias del mes */}
        <Card title="Asistencias del Mes Actual">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily_attendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0088FE"
                name="Total"
                strokeWidth={3}
                dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
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
      </div>

      {/* Estadísticas detalladas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Card title="Hoy" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
            {formatNumber(general_stats.today.total_attendances)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
            <div>↗ {formatNumber(general_stats.today.total_entries)} entradas</div>
            <div>↙ {formatNumber(general_stats.today.total_exits)} salidas</div>
            <div>👥 {formatNumber(general_stats.today.unique_visitors)} visitantes</div>
          </div>
        </Card>

        <Card title="Este Mes" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
            {formatNumber(general_stats.this_month.total_attendances)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
            <div>↗ {formatNumber(general_stats.this_month.total_entries)} entradas</div>
            <div>↙ {formatNumber(general_stats.this_month.total_exits)} salidas</div>
            <div>👥 {formatNumber(general_stats.this_month.unique_visitors)} visitantes</div>
          </div>
        </Card>

        <Card title="Este Año" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14', marginBottom: '8px' }}>
            {formatNumber(general_stats.this_year.total_attendances)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
            <div>↗ {formatNumber(general_stats.this_year.total_entries)} entradas</div>
            <div>↙ {formatNumber(general_stats.this_year.total_exits)} salidas</div>
            <div>👥 {formatNumber(general_stats.this_year.unique_visitors)} visitantes</div>
          </div>
        </Card>
      </div>

      {/* Top usuarios */}
      <Card title="Top 10 Usuarios con Más Asistencias (Últimos 30 días)">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Pos</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Entradas</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Salidas</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actividad</th>
            </tr>
            </thead>
            <tbody>
            {top_users.map((user, index) => {
              const maxAttendances = top_users[0]?.total_attendances || 1;
              const percentage = calculatePercentage(user.total_attendances, maxAttendances);

              return (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: COLORS[index % COLORS.length],
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                    {formatNumber(user.total_attendances)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {formatNumber(user.entries)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {formatNumber(user.exits)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      margin: '0 auto'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                        {percentage}%
                      </span>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
          {top_users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No hay datos de usuarios disponibles
            </div>
          )}
        </div>
      </Card>
    </ModuleContent>
  );
};

export default ClubDashboard;
