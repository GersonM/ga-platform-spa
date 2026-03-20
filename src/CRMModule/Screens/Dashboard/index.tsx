import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Empty, Row, Select, Space, Spin, Statistic, Tag } from 'antd'
import { ResponsiveContainer, Tooltip, FunnelChart, Funnel, Cell } from 'recharts'
import { PiChartBarFill, PiUserFocus, PiUsers, PiHandshake } from 'react-icons/pi'
import axios from 'axios'

import ModuleContent from '../../../CommonUI/ModuleContent'
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader'
import type { CommercialProcess, CommercialProcessStage } from '../../../Types/api'
import ErrorHandler from '../../../Utils/ErrorHandler'

interface FunnelDataItem {
  stageUuid: string
  stage: string
  value: number
  fill: string
}

const STAGE_COLORS = ['#1d4ed8', '#0284c7', '#0d9488', '#65a30d', '#16a34a', '#d97706', '#dc2626']

const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
const getStageOrder = (stage: CommercialProcessStage) => Number((stage as any)?.order ?? 0)

const normalizeStage = (stage: any, index: number): CommercialProcessStage => ({
  ...stage,
  uuid: stage?.uuid ?? `${index + 1}`,
  name: stage?.name ?? stage?.title ?? `Etapa ${index + 1}`,
  order: stage?.order ?? index + 1,
  description: stage?.description ?? '',
  created_at: stage?.created_at ?? '',
})

const normalizeProcess = (process: any): CommercialProcess => {
  const rawStages = isArray(process?.stages)
    ? process.stages
    : isArray(process?.process_stages)
      ? process.process_stages
      : isArray(process?.steps)
        ? process.steps
        : []

  return {
    ...process,
    uuid: process?.uuid ?? '',
    name: process?.name ?? '',
    description: process?.description ?? '',
    created_at: process?.created_at ?? '',
    stages: rawStages.map((stage: any, index: number) => normalizeStage(stage, index)),
  }
}

const CRMFunnelDashboard = () => {
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingFunnel, setLoadingFunnel] = useState(false)
  const [processes, setProcesses] = useState<CommercialProcess[]>([])
  const [selectedProcessUuid, setSelectedProcessUuid] = useState<string>()
  const [funnelData, setFunnelData] = useState<FunnelDataItem[]>([])

  const selectedProcess = useMemo(
    () => processes.find(process => process.uuid === selectedProcessUuid),
    [processes, selectedProcessUuid]
  )

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source()
    const config = {
      cancelToken: cancelTokenSource.token,
    }

    setLoading(true)
    axios
      .get<{ data?: CommercialProcess[] } | CommercialProcess[]>('commercial/processes', config)
      .then(response => {
        const payload = response.data
        const processList = isArray(payload) ? payload : isArray(payload?.data) ? payload.data : []
        const normalizedProcesses = (processList as CommercialProcess[]).map(normalizeProcess)
        setProcesses(normalizedProcesses)
        if (!selectedProcessUuid && normalizedProcesses.length > 0) {
          setSelectedProcessUuid(normalizedProcesses[0].uuid)
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error)
      })
      .finally(() => {
        setLoading(false)
      })

    return cancelTokenSource.cancel
  }, [reload])

  useEffect(() => {
    if (!selectedProcess) {
      setFunnelData([])
      return
    }

    const stages = [...selectedProcess.stages].sort((a, b) => getStageOrder(a) - getStageOrder(b))
    if (stages.length === 0) {
      setFunnelData([])
      return
    }

    setLoadingFunnel(true)
    const data = stages.map((stage, index) => ({
      stageUuid: stage.uuid,
      stage: stage.name || `Etapa ${index + 1}`,
      value: Number((stage as any).leads_count ?? 0),
      fill: STAGE_COLORS[index % STAGE_COLORS.length],
    })) as FunnelDataItem[]

    setFunnelData(data)
    setLoadingFunnel(false)
  }, [selectedProcess, reload])

  const totalLeads = funnelData[0]?.value ?? 0
  const closedLeads = funnelData[funnelData.length - 1]?.value ?? 0
  const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0'

  return (
    <ModuleContent boxed>
      <ContentHeader
        title='Dashboard CRM'
        onRefresh={() => setReload(!reload)}
        loading={loading || loadingFunnel}
        tools={
          <Select
            value={selectedProcessUuid}
            style={{ width: 300 }}
            placeholder='Selecciona un proceso'
            options={processes.map(process => ({ value: process.uuid, label: process.name }))}
            onChange={value => setSelectedProcessUuid(value)}
          />
        }
      />
      <p>Resumen del embudo comercial actual</p>

      <Spin spinning={loading || loadingFunnel}>
        {!selectedProcess && <Empty description='No hay procesos disponibles' />}
        {selectedProcess && funnelData.length === 0 && <Empty description='Este proceso no tiene etapas o leads' />}

        {selectedProcess && funnelData.length > 0 && (
          <>
            <div className={'grid-layout-fit'}>
              <Card>
                <Statistic title='Leads Totales' value={totalLeads} prefix={<PiUsers />} />
              </Card>
              <Card>
                <Statistic title='Leads Cerrados' value={closedLeads} prefix={<PiHandshake />} />
              </Card>
              <Card>
                <Statistic title='Conversión' value={conversionRate} suffix='%' prefix={<PiUserFocus />} />
              </Card>
            </div>

            <Row gutter={[20, 20]}>
              <Col xs={24}>
                <Card title={`Funnel de Ventas CRM - ${selectedProcess.name}`}>
                  <div
                    style={{ width: '100%', height: 420, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <div style={{ width: 420, height: 320, transform: 'rotate(-90deg)' }}>
                      <ResponsiveContainer width='100%' height='100%'>
                        <FunnelChart>
                          <Tooltip formatter={value => [new Intl.NumberFormat('es-PE').format(Number(value)), 'Leads']} />
                          <Funnel data={funnelData} dataKey='value' nameKey='stage' isAnimationActive>
                            {funnelData.map(item => (
                              <Cell key={item.stageUuid} fill={item.fill} />
                            ))}
                          </Funnel>
                        </FunnelChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <Space wrap>
                    {funnelData.map(item => (
                      <Tag key={item.stageUuid} color={item.fill}>
                        {item.stage}: {new Intl.NumberFormat('es-PE').format(item.value)}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Spin>

      <p style={{ fontSize: 12, opacity: 0.8 }}>
        <PiChartBarFill style={{ marginRight: 6 }} />
        Funnel calculado con las etapas del proceso seleccionado
      </p>
    </ModuleContent>
  )
}

export default CRMFunnelDashboard
