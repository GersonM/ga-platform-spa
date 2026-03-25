import axios from "axios";
import {useEffect, useState} from 'react';
import {Badge, Col, Collapse, Row, Space, Tag} from 'antd';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ErrorHandler from '../../../Utils/ErrorHandler';

type InsightLevel = 'low' | 'medium' | 'high';

type Insight = {
  name: string;
  level: InsightLevel;
  handler: string;
  results: any[] | Record<string, any[]>;
};

type SystemInsightsData = {
  total_alerts: number;
  timestamp: string;
  insights: Insight[];
};

const levelColor: Record<InsightLevel, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
};

const levelLabel: Record<InsightLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const insightLabel: Record<string, string> = {
  'duplicated-profiles': 'Perfiles duplicados',
  'expired-invoices': 'Facturas vencidas',
  'expiring-contracts': 'Contratos por vencer',
  'stock-alerts': 'Alertas de stock',
  'invoice-documents': 'Facturas sin documento',
  'incomplete-payment-alerts': 'Pagos incompletos',
};

const insightDescription: Record<string, string> = {
  'duplicated-profiles': 'Perfiles con el mismo email o número de documento. Revisar para evitar registros repetidos.',
  'expired-invoices': 'Facturas cuya fecha de vencimiento ya pasó y no han sido pagadas.',
  'expiring-contracts': 'Contratos próximos a vencer que podrían necesitar renovación.',
  'stock-alerts': 'Items de inventario con información incompleta, como precio de venta no definido.',
  'invoice-documents': 'Facturas pagadas o pendientes que aún no tienen un comprobante SUNAT emitido.',
  'incomplete-payment-alerts': 'Facturas con pagos parciales. El monto abonado no cubre el total.',
};

const messageTranslation: Record<string, string> = {
  'Stock without sale price': 'Sin precio de venta definido',
  'Invoice without SUNAT document': 'Sin comprobante SUNAT emitido',
  'Invoice with incomplete payment': 'Pago parcial — monto pendiente por cobrar',
};

const duplicatedFieldLabel: Record<string, string> = {
  personal_email: 'Email personal',
  email: 'Email',
  doc_number: 'Nº documento',
};

const getClientName = (invoice: any): string => {
  const entity = invoice?.client?.entity;
  if (!entity) return '—';
  return [entity.name, entity.last_name].filter(Boolean).join(' ') || entity.name || '—';
};

const renderResults = (insight: Insight) => {
  const {name, results} = insight;
  const description = insightDescription[name];

  const descriptionEl = description
    ? <p style={{color: '#888', fontSize: 12, marginTop: 0, marginBottom: 8}}>{description}</p>
    : null;

  if (!Array.isArray(results)) {
    const counts = Object.entries(results as Record<string, any[]>).map(([key, arr]) => (
      <div key={key}>
        <small style={{color: '#888'}}>{duplicatedFieldLabel[key] ?? key}:</small>{' '}
        <strong>{arr.length}</strong>
      </div>
    ));
    const total = Object.values(results as Record<string, any[]>).reduce((s, a) => s + a.length, 0);
    return (
      <>
        {descriptionEl}
        {total === 0
          ? <span style={{color: '#52c41a'}}>Sin duplicados encontrados</span>
          : <Space direction="vertical" size={2}>{counts}</Space>}
      </>
    );
  }

  if (results.length === 0) {
    return (
      <>
        {descriptionEl}
        <span style={{color: '#52c41a'}}>Sin alertas activas</span>
      </>
    );
  }

  if (name === 'expired-invoices') {
    return (
      <>
        {descriptionEl}
        <Space direction="vertical" size={2} style={{width: '100%'}}>
          {results.map((inv: any) => (
            <div key={inv.uuid} style={{fontSize: 12}}>
              <Tag color="default">#{inv.tracking_id}</Tag>
              <span style={{marginRight: 8}}>{getClientName(inv)}</span>
              <span style={{color: '#888'}}>{inv.currency} {inv.amount?.toLocaleString()}</span>
              <span style={{marginLeft: 8, color: '#f5222d'}}>Vence: {inv.expires_on}</span>
            </div>
          ))}
        </Space>
      </>
    );
  }

  // stock-alerts, invoice-documents, incomplete-payment-alerts
  return (
    <>
      {descriptionEl}
      <Space direction="vertical" size={2} style={{width: '100%'}}>
        {results.map((item: any, i: number) => (
          <div key={i} style={{fontSize: 12}}>
            <Tag color={levelColor[item.level as InsightLevel] ?? 'default'}>
              {levelLabel[item.level as InsightLevel] ?? item.level}
            </Tag>
            <span style={{marginRight: 8}}>
              {messageTranslation[item.message] ?? item.message}
            </span>
            {item.data?.tracking_id && <span style={{color: '#888'}}>Factura #{item.data.tracking_id}</span>}
            {item.data?.name && <span style={{color: '#888'}}> — {item.data.name}</span>}
          </div>
        ))}
      </Space>
    </>
  );
};

const SystemInsights = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SystemInsightsData>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token};

    setLoading(true);
    axios
      .get(`workspaces/system-insights`, config)
      .then(response => {
        setLoading(false);
        if (response) setData(response.data);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const getCount = (insight: Insight): number =>
    Array.isArray(insight.results)
      ? insight.results.length
      : Object.values(insight.results).reduce((s: number, a) => s + (a as any[]).length, 0);

  return (
    <div style={{position: 'relative'}}>
      <LoadingIndicator visible={loading} overlay/>
      {data && (
        <>
          <div style={{marginBottom: 12, color: '#888', fontSize: 12}}>
            {data.timestamp} &mdash; <strong>{data.total_alerts}</strong> alertas totales
          </div>
          <Row gutter={[12, 12]}>
            {data.insights.map(insight => {
              const count = getCount(insight);
              const label = insightLabel[insight.name] ?? insight.name;
              return (
                <Col key={insight.name} xs={24} md={12}>
                  <Collapse
                    size="small"
                    items={[{
                      key: insight.name,
                      label: (
                        <Space size={6}>
                          <Tag color={levelColor[insight.level]} style={{margin: 0}}>
                            {levelLabel[insight.level]}
                          </Tag>
                          <span>{label}</span>
                          <Badge count={count} color={count === 0 ? '#52c41a' : undefined} showZero/>
                        </Space>
                      ),
                      children: (
                      <div style={{maxHeight: 250, overflowY: 'auto'}}>
                        {renderResults(insight)}
                      </div>
                    ),
                    }]}
                  />
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
};

export default SystemInsights;
