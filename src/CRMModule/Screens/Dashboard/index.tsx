import {useEffect, useMemo, useState} from 'react'
import {Card, Col, Empty, Row, Select, Space, Spin, Statistic, Tag} from 'antd'
import {PiChartBarFill, PiCheckCircle, PiUserMinus, PiUsers} from 'react-icons/pi'
import axios from 'axios'
import {sankey as d3Sankey, sankeyLeft, sankeyLinkHorizontal} from 'd3-sankey'

import ModuleContent from '../../../CommonUI/ModuleContent'
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader'
import ErrorHandler from '../../../Utils/ErrorHandler'

interface LeadRecord {
  uuid: string
  disqualified_at?: string | null
  commercial_contract_uuid?: string | null
  process_stage_uuid?: string | null
  process_stage?: {
    uuid?: string | null
  } | null
  campaign?: {
    name?: string | null
  } | null
  contract?: {
    status?: string | null
  } | null
}

interface SankeyNodeInput {
  id: string
  name: string
  color: string
}

interface SankeyLinkInput {
  source: string
  target: string
  value: number
  realValue: number
  percentage: number
  label: string
  isDisqualified: boolean
}

interface ProcessStageRecord {
  uuid: string
}

interface ProcessRecord {
  uuid: string
  name: string
  stages: ProcessStageRecord[]
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
const toVisibleFlow = (value: number): number => (value > 0 ? value : 1)
const getPercentage = (value: number, total: number): number => (total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0)

const extractLeads = (payload: any): LeadRecord[] => {
  if (isArray(payload?.data)) return payload.data as LeadRecord[]
  if (isArray(payload)) return payload as LeadRecord[]
  return []
}
const extractProcesses = (payload: any): ProcessRecord[] => {
  const list = isArray(payload) ? payload : isArray(payload?.data) ? payload.data : []

  return (list as any[]).map(process => {
    const rawStages = isArray(process?.stages)
      ? process.stages
      : isArray(process?.process_stages)
        ? process.process_stages
        : isArray(process?.steps)
          ? process.steps
          : []

    return {
      uuid: process?.uuid ?? '',
      name: process?.name ?? 'Proceso',
      stages: rawStages.map((stage: any, index: number) => ({
        uuid: stage?.uuid ?? `${process?.uuid ?? 'process'}-stage-${index + 1}`,
      })),
    } as ProcessRecord
  })
}

const getLastPage = (payload: any): number => Number(payload?.meta?.last_page ?? payload?.last_page ?? 1)
const getCurrentPage = (payload: any, fallback: number): number => Number(payload?.meta?.current_page ?? payload?.current_page ?? fallback)

const hasCommercialContractUuid = (lead: LeadRecord): boolean =>
  lead.commercial_contract_uuid !== null && lead.commercial_contract_uuid !== undefined
const getCampaignName = (lead: LeadRecord): string => {
  const campaignName = lead.campaign?.name?.trim()
  return campaignName && campaignName.length > 0 ? campaignName : 'Sin campaña'
}

const hasValidContract = (lead: LeadRecord): boolean => {
  const contract = lead.contract
  if (!contract) return false
  const status = String(contract.status ?? '').toLowerCase()
  return status !== 'voided' && status !== 'proposal'
}

const isDisqualified = (lead: LeadRecord): boolean => Boolean(lead.disqualified_at)

const CRMSankeyDashboard = () => {
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [processes, setProcesses] = useState<ProcessRecord[]>([])
  const [selectedProcessUuid, setSelectedProcessUuid] = useState<string>('all')

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source()
    const config = {
      cancelToken: cancelTokenSource.token,
    }

    const loadLeads = async () => {
      setLoading(true)
      try {
        const processResponse = await axios.get('commercial/processes', config)
        setProcesses(extractProcesses(processResponse.data))

        const allLeads: LeadRecord[] = []
        let page = 1
        let lastPage = 1

        while (page <= lastPage) {
          const response = await axios.get('commercial/leads', {
            ...config,
            params: {
              page,
              page_size: 200,
            },
          })

          const payload = response.data
          const chunk = extractLeads(payload)
          allLeads.push(...chunk)

          lastPage = getLastPage(payload)
          const currentPage = getCurrentPage(payload, page)
          if (chunk.length === 0 || currentPage >= lastPage) {
            break
          }
          page = currentPage + 1
        }

        setLeads(allLeads)
      } catch (error) {
        ErrorHandler.showNotification(error)
      } finally {
        setLoading(false)
      }
    }

    loadLeads()

    return cancelTokenSource.cancel
  }, [reload])

  const stageToProcessMap = useMemo(() => {
    const map = new Map<string, string>()
    processes.forEach(process => {
      process.stages.forEach(stage => {
        map.set(stage.uuid, process.uuid)
      })
    })
    return map
  }, [processes])

  const filteredLeads = useMemo(() => {
    if (selectedProcessUuid === 'all') return leads

    return leads.filter(lead => {
      const stageUuid = lead.process_stage_uuid ?? lead.process_stage?.uuid
      if (!stageUuid) return false
      return stageToProcessMap.get(stageUuid) === selectedProcessUuid
    })
  }, [leads, selectedProcessUuid, stageToProcessMap])

  const stepData = useMemo(() => {
    const step1 = filteredLeads
    const step2 = filteredLeads.filter(hasCommercialContractUuid)
    const step3 = step2.filter(hasValidContract)

    const disqStep1 = step1.filter(isDisqualified)
    const disqStep2 = step2.filter(isDisqualified)
    const disqStep3 = step3.filter(isDisqualified)
    const validFinal = step3.filter(lead => !isDisqualified(lead))

    return {
      step1,
      step2,
      step3,
      disqStep1,
      disqStep2,
      disqStep3,
      validFinal,
    }
  }, [filteredLeads])

  const chartInput = useMemo(() => {
    const totalStep1 = stepData.step1.length
    const totalStep2 = stepData.step2.length
    const totalStep3 = stepData.step3.length
    const campaignCounts = new Map<string, number>()

    stepData.step1.forEach(lead => {
      const campaignName = getCampaignName(lead)
      campaignCounts.set(campaignName, (campaignCounts.get(campaignName) ?? 0) + 1)
    })

    const campaignEntries = Array.from(campaignCounts.entries()).sort((a, b) => b[1] - a[1])
    const campaignNodes: SankeyNodeInput[] = campaignEntries.map(([campaignName], index) => ({
      id: `camp-${index}`,
      name: `Campaña: ${campaignName}`,
      color: '#0f766e',
    }))

    const nodes: SankeyNodeInput[] = [
      ...campaignNodes,
      {id: 'n1', name: '1) Todos los leads', color: '#1d4ed8'},
      {id: 'n2', name: '2) Propuesta enviada', color: '#1e40af'},
      {id: 'n3', name: '3) Propuesta aprobada', color: '#1e3a8a'},
      {id: 'dq1', name: 'Descalificados N1', color: '#dc2626'},
      {id: 'dq2', name: 'Descalificados N2', color: '#dc2626'},
      {id: 'ok', name: 'Venta cerrada', color: '#16a34a'},
      {id: 'dq3', name: 'Descalificados N3', color: '#dc2626'},
    ]

    const links: SankeyLinkInput[] = [
      ...campaignEntries.map(([campaignName, count], index) => ({
        source: `camp-${index}`,
        target: 'n1',
        value: toVisibleFlow(count),
        realValue: count,
        percentage: getPercentage(count, totalStep1),
        label: `Campaña ${campaignName} -> Nivel 1`,
        isDisqualified: false,
      })),
      {
        source: 'n1',
        target: 'n2',
        value: toVisibleFlow(stepData.step2.length),
        realValue: stepData.step2.length,
        percentage: getPercentage(stepData.step2.length, totalStep1),
        label: 'Nivel 1 -> Nivel 2',
        isDisqualified: false,
      },
      {
        source: 'n1',
        target: 'dq1',
        value: toVisibleFlow(stepData.disqStep1.length),
        realValue: stepData.disqStep1.length,
        percentage: getPercentage(stepData.disqStep1.length, totalStep1),
        label: 'Nivel 1 -> Descalificados N1',
        isDisqualified: true,
      },
      {
        source: 'n2',
        target: 'n3',
        value: toVisibleFlow(stepData.step3.length),
        realValue: stepData.step3.length,
        percentage: getPercentage(stepData.step3.length, totalStep2),
        label: 'Nivel 2 -> Nivel 3',
        isDisqualified: false,
      },
      {
        source: 'n2',
        target: 'dq2',
        value: toVisibleFlow(stepData.disqStep2.length),
        realValue: stepData.disqStep2.length,
        percentage: getPercentage(stepData.disqStep2.length, totalStep2),
        label: 'Nivel 2 -> Descalificados N2',
        isDisqualified: true,
      },
      {
        source: 'n3',
        target: 'ok',
        value: toVisibleFlow(stepData.validFinal.length),
        realValue: stepData.validFinal.length,
        percentage: getPercentage(stepData.validFinal.length, totalStep3),
        label: 'Nivel 3 -> Resultado válido',
        isDisqualified: false,
      },
      {
        source: 'n3',
        target: 'dq3',
        value: toVisibleFlow(stepData.disqStep3.length),
        realValue: stepData.disqStep3.length,
        percentage: getPercentage(stepData.disqStep3.length, totalStep3),
        label: 'Nivel 3 -> Descalificados N3',
        isDisqualified: true,
      },
    ]

    return {nodes, links}
  }, [stepData])

  const sankeyLayout = useMemo(() => {
    const width = 1200
    const height = 560

    const generator = d3Sankey<any, any>()
      .nodeId((d: any) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(16)
      .nodePadding(34)
      .extent([[20, 20], [width - 260, height - 20]])

    const input = {
      nodes: chartInput.nodes.map(node => ({...node})),
      links: chartInput.links.map(link => ({...link})),
    }

    const graph = generator(input as any)
    const linkPath = sankeyLinkHorizontal()

    return {
      width,
      height,
      nodes: graph.nodes as any[],
      links: graph.links as any[],
      linkPath,
    }
  }, [chartInput])

  const disqualifiedTotal = stepData.disqStep1.length

  return (
    <ModuleContent boxed>
      <ContentHeader
        title='Dashboard CRM'
        onRefresh={() => setReload(!reload)}
        loading={loading}
        tools={
          <Select
            value={selectedProcessUuid}
            style={{width: 320}}
            options={[
              {value: 'all', label: 'Todos los procesos'},
              ...processes.map(process => ({value: process.uuid, label: process.name})),
            ]}
            onChange={value => setSelectedProcessUuid(value)}
          />
        }
      />
      <p>Seguimiento de progreso de leads</p>

      <Spin spinning={loading}>
        {stepData.step1.length === 0 && <Empty description='No hay datos suficientes para graficar'/>}

        {stepData.step1.length > 0 && (
          <>
            <div className={'grid-layout-fit'}>
              <Card>
                <Statistic title='Leads Totales' value={stepData.step1.length} prefix={<PiUsers/>}/>
              </Card>
              <Card>
                <Statistic title='Nivel 2' value={stepData.step2.length}/>
              </Card>
              <Card>
                <Statistic title='Nivel 3' value={stepData.step3.length}/>
              </Card>
              <Card>
                <Statistic title='Resultado Válido' value={stepData.validFinal.length} prefix={<PiCheckCircle/>}/>
              </Card>
            </div>

            <Row gutter={[20, 20]}>
              <Col xs={24}>
                <div style={{width: '100%', height: 560, overflowX: 'auto'}}>
                  <svg viewBox={`0 0 ${sankeyLayout.width} ${sankeyLayout.height}`}
                       style={{width: '100%', height: '100%'}}>
                    {sankeyLayout.links.map((link, index) => {
                      const d = sankeyLayout.linkPath(link)
                      const stroke = link.isDisqualified ? '#dc2626' : '#94a3b8'

                      return (
                        <path
                          key={`link-${index}`}
                          d={d || ''}
                          fill='none'
                          stroke={stroke}
                          strokeOpacity={link.isDisqualified ? 0.65 : 0.35}
                          strokeWidth={Math.max(1, Number(link.width || 1))}
                        >
                          <title>{`${link.label}: ${link.realValue} (${link.percentage}%)`}</title>
                        </path>
                      )
                    })}

                    {sankeyLayout.nodes.map((node, index) => {
                      const textX = Number(node.x1) + 8
                      const textY = Number(node.y0) + Math.max((Number(node.y1) - Number(node.y0)) / 2, 8)
                      const height = Math.max(1, Number(node.y1) - Number(node.y0))

                      return (
                        <g key={`node-${index}`}>
                          <rect
                            x={node.x0}
                            y={node.y0}
                            width={Math.max(1, Number(node.x1) - Number(node.x0))}
                            height={height}
                            fill={node.color || '#1d4ed8'}
                            fillOpacity={0.85}
                            rx={2}
                          >
                            <title>{`${node.name}: ${new Intl.NumberFormat('es-PE').format(Number(node.value || 0))}`}</title>
                          </rect>
                          <text x={textX} y={textY} fontSize={11} fill='#111827' dominantBaseline='middle'>
                            {node.name}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
                <Space wrap>
                  <Tag color='error' icon={<PiUserMinus/>}>
                    Descalificados totales: {new Intl.NumberFormat('es-PE').format(disqualifiedTotal)}
                  </Tag>
                  {chartInput.links.map((link, index) => (
                    <Tag key={`${link.source}-${link.target}-${index}`}
                         color={link.isDisqualified ? 'error' : 'processing'}>
                      {link.label}: {link.percentage}%
                    </Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Spin>

      <p style={{fontSize: 12, opacity: 0.8}}>
        <PiChartBarFill style={{marginRight: 6}}/>
        Gráfico Sankey implementado con D3 (`d3-sankey`)
      </p>
    </ModuleContent>
  )
}

export default CRMSankeyDashboard
