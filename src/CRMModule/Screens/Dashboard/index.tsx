import {useEffect, useMemo, useState} from 'react'
import {DatePicker, Empty, Select, Space, Spin} from 'antd'
import {PiCheckCircle, PiFilePdf, PiTrendUp, PiUsers} from 'react-icons/pi'
import axios from 'axios'
import dayjs, {type Dayjs} from 'dayjs'

import ModuleContent from '../../../CommonUI/ModuleContent'
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader'
import ErrorHandler from '../../../Utils/ErrorHandler'
import {type Lead} from '../../../Types/api.tsx'
import LeadsFlowGraph, {type LeadsFlowLinkInput, type LeadsFlowNodeInput} from './LeadsFlowGraph'
import LeadsDate from './LeadsDate'
import ProcessStagesSankey from './ProcessStagesSankey'
import InfoButton from "../../../CommonUI/InfoButton";

interface ProcessStageRecord {
  uuid: string
  name: string
  order: number
}

interface ProcessRecord {
  uuid: string
  name: string
  stages: ProcessStageRecord[]
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
const getPercentage = (value: number, total: number): number => (total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0)

const extractLeads = (payload: any): Lead[] => {
  if (isArray(payload?.data)) return payload.data as Lead[]
  if (isArray(payload)) return payload as Lead[]
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
      stages: rawStages
        .map((stage: any, index: number) => ({
          uuid: stage?.uuid ?? `${process?.uuid ?? 'process'}-stage-${index + 1}`,
          name: stage?.name ?? `Etapa ${index + 1}`,
          order: Number(stage?.order ?? index + 1),
        }))
        .sort((a:any, b:any) => a.order - b.order),
    } as ProcessRecord
  })
}

const getLastPage = (payload: any): number => Number(payload?.meta?.last_page ?? payload?.last_page ?? 1)
const getCurrentPage = (payload: any, fallback: number): number => Number(payload?.meta?.current_page ?? payload?.current_page ?? fallback)

const EXCLUDED_CONTRACT_STATUSES = new Set(['proposal', 'cancelled', 'terminated', 'voided'])

const hasCommercialContract = (lead: Lead): boolean => !!lead.contract_uuid

const getCampaignName = (lead: Lead): string => {
  const campaignName = lead.campaign?.name?.trim()
  return campaignName && campaignName.length > 0 ? campaignName : 'Sin campaña'
}

const hasValidContract = (lead: Lead): boolean => {
  const contract = lead.contract
  if (!contract) return false
  return !EXCLUDED_CONTRACT_STATUSES.has(String(contract.status ?? '').toLowerCase())
}

const isDisqualified = (lead: Lead): boolean => Boolean(lead.disqualified_at)
const isConverted = (lead: Lead): boolean => Boolean(lead.contract?.approved_at)

const isWithinDateRange = (createdAt: string | null | undefined, range: [Dayjs | null, Dayjs | null]): boolean => {
  const [start, end] = range
  if (!start && !end) return true
  if (!createdAt) return false

  const date = dayjs(createdAt)
  if (!date.isValid()) return false
  if (start && date.isBefore(start.startOf('day'))) return false
  if (end && date.isAfter(end.endOf('day'))) return false
  return true
}

const CRMSankeyDashboard = () => {
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [processes, setProcesses] = useState<ProcessRecord[]>([])
  const [selectedProcessUuid, setSelectedProcessUuid] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])

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

        const allLeads: Lead[] = []
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
          if (chunk.length === 0 || currentPage >= lastPage) break
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
    return leads.filter(lead => {
      if (!isWithinDateRange(lead.created_at, dateRange)) return false
      if (selectedProcessUuid === 'all') return true
      const stageUuid = lead.process_stage_uuid ?? lead.process_stage?.uuid
      if (!stageUuid) return false
      return stageToProcessMap.get(stageUuid) === selectedProcessUuid
    })
  }, [leads, selectedProcessUuid, stageToProcessMap, dateRange])

  const stepData = useMemo(() => {
    const step1 = filteredLeads
    const step2 = filteredLeads.filter(hasCommercialContract)
    const step3 = step2.filter(hasValidContract)

    const disqStep1 = step1.filter(lead => isDisqualified(lead) && !hasCommercialContract(lead))
    const disqStep2 = step2.filter(lead => isDisqualified(lead) && !hasValidContract(lead))
    const disqStep3 = step3.filter(isDisqualified)

    return {
      step1,
      step2,
      step3,
      disqStep1,
      disqStep2,
      disqStep3,
      validFinal: step3.filter(lead => !isDisqualified(lead)),
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
    const campaignNodes: LeadsFlowNodeInput[] = campaignEntries.map(([campaignName], index) => ({
      id: `camp-${index}`,
      name: `Campaña: ${campaignName}`,
      color: '#0f766e',
    }))

    const nodes: LeadsFlowNodeInput[] = [
      ...campaignNodes,
      {id: 'n1', name: 'Todos los leads', color: '#1d4ed8'},
      {id: 'n2', name: 'Propuesta enviada', color: '#1e40af'},
      {id: 'n3', name: 'Propuesta aprobada', color: '#1e3a8a'},
      {id: 'dq1', name: 'Descalificados N1', color: '#dc2626'},
      {id: 'dq2', name: 'Descalificados N2', color: '#dc2626'},
      {id: 'ok', name: 'Venta cerrada', color: '#16a34a'},
      {id: 'dq3', name: 'Descalificados N3', color: '#dc2626'},
    ]

    const createLink = (
      source: string,
      target: string,
      realValue: number,
      base: number,
      label: string,
      isDisqualified = false
    ): LeadsFlowLinkInput => ({
      source,
      target,
      value: realValue,
      realValue,
      percentage: getPercentage(realValue, base),
      label,
      isDisqualified,
    })

    const links: LeadsFlowLinkInput[] = [
      ...campaignEntries.map(([campaignName, count], index) =>
        createLink(`camp-${index}`, 'n1', count, totalStep1, `Campaña ${campaignName} -> Nivel 1`)
      ),
      createLink('n1', 'n2', stepData.step2.length, totalStep1, 'Nivel 1 -> Nivel 2'),
      createLink('n1', 'dq1', stepData.disqStep1.length, totalStep1, 'Nivel 1 -> Descalificados N1', true),
      createLink('n2', 'n3', stepData.step3.length, totalStep2, 'Nivel 2 -> Nivel 3'),
      createLink('n2', 'dq2', stepData.disqStep2.length, totalStep2, 'Nivel 2 -> Descalificados N2', true),
      createLink('n3', 'ok', stepData.validFinal.length, totalStep3, 'Nivel 3 -> Resultado válido'),
      createLink('n3', 'dq3', stepData.disqStep3.length, totalStep3, 'Nivel 3 -> Descalificados N3', true),
    ].filter(link => !link.isDisqualified || link.realValue > 0)

    return {nodes, links}
  }, [stepData])

  const selectedProcessForStages = useMemo(() => {
    if (selectedProcessUuid === 'all') return null
    return processes.find(process => process.uuid === selectedProcessUuid) ?? null
  }, [processes, selectedProcessUuid])

  const stageFlowLeads = useMemo(() => {
    if (!selectedProcessForStages) return []

    return leads.filter(lead => {
      if (!isWithinDateRange(lead.created_at, dateRange)) return false
      const stageUuid = lead.process_stage_uuid ?? lead.process_stage?.uuid
      if (!stageUuid) return false
      return stageToProcessMap.get(stageUuid) === selectedProcessForStages.uuid
    })
  }, [leads, selectedProcessForStages, stageToProcessMap, dateRange])

  const conversionCount = stepData.step1.filter(isConverted).length
  const conversionRate = stepData.step1.length > 0
    ? Number(((conversionCount / stepData.step1.length) * 100).toFixed(1))
    : 0

  return (
    <ModuleContent boxed>
      <ContentHeader
        title='Dashboard CRM'
        onRefresh={() => setReload(!reload)}
        loading={loading}
        tools={
          <>
            <Select
              value={selectedProcessUuid}
              options={[
                {value: 'all', label: 'Todos los procesos'},
                ...processes.map(process => ({value: process.uuid, label: process.name})),
              ]}
              onChange={value => setSelectedProcessUuid(value)}
            />
            <DatePicker.RangePicker
              value={dateRange}
              onChange={values => setDateRange((values as [Dayjs | null, Dayjs | null]) ?? [null, null])}
              allowEmpty={[true, true]}
              format='DD/MM/YYYY'
            />
          </>
        }
      />
      <p>Seguimiento de progreso de leads</p>

      <Spin spinning={loading}>
        {stepData.step1.length === 0 && <Empty description='No hay datos suficientes para graficar'/>}

        {stepData.step1.length > 0 && (
          <>
            <Space>
              <InfoButton icon={<PiUsers/>} label={'Leads totales'} value={stepData.step1.length} large/>
              <InfoButton icon={<PiFilePdf/>} label={'Propuestas enviadas'} value={stepData.step2.length} large/>
              <InfoButton icon={<PiCheckCircle/>} label={'Aprobaciones'} value={stepData.step3.length} large/>
              <InfoButton icon={<PiTrendUp/>} label={'Conversión'} value={conversionRate+'%'} large/>
            </Space>
            <LeadsFlowGraph chartInput={chartInput}/>
            <h3 style={{marginTop: 24, marginBottom: 8}}>Flujo entre etapas del proceso</h3>
            <ProcessStagesSankey process={selectedProcessForStages} leads={stageFlowLeads}/>
            <LeadsDate leads={stepData.step1}/>
          </>
        )}
      </Spin>
    </ModuleContent>
  )
}

export default CRMSankeyDashboard
