import { Empty } from 'antd'

import { type Lead } from '../../../Types/api.tsx'
import LeadsFlowGraph, { type LeadsFlowLinkInput, type LeadsFlowNodeInput } from './LeadsFlowGraph'

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

interface ProcessStagesSankeyProps {
  process: ProcessRecord | null
  leads: Lead[]
}

const getPercentage = (value: number, total: number): number => (
  total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0
)
const isDisqualified = (lead: Lead): boolean => Boolean(lead.disqualified_at)
const toVisibleFlow = (value: number): number => (value > 0 ? value : 1)

const ProcessStagesSankey = ({ process, leads }: ProcessStagesSankeyProps) => {
  if (!process) {
    return <Empty description='Selecciona un proceso para visualizar el flujo entre etapas' />
  }

  if (!process.stages.length) {
    return <Empty description='El proceso no tiene etapas configuradas' />
  }

  const stageIndexMap = new Map<string, number>()
  process.stages.forEach((stage, index) => {
    stageIndexMap.set(stage.uuid, index)
  })

  const stageCounts = process.stages.map(() => 0)
  const disqualifiedStageCounts = process.stages.map(() => 0)
  leads.forEach(lead => {
    const stageUuid = lead.process_stage_uuid ?? lead.process_stage?.uuid
    if (!stageUuid) return
    const index = stageIndexMap.get(stageUuid)
    if (index === undefined) return
    stageCounts[index] += 1
    if (isDisqualified(lead)) {
      disqualifiedStageCounts[index] += 1
    }
  })

  const reachedCounts = stageCounts.map((_, index) => (
    stageCounts.slice(index).reduce((sum, value) => sum + value, 0)
  ))
  const totalLeads = reachedCounts[0] ?? 0

  if (totalLeads === 0) {
    return <Empty description='No hay leads en el proceso para graficar etapas' />
  }

  const nodes: LeadsFlowNodeInput[] = [
    { id: 'proc-root', name: process.name, color: '#0f766e' },
    ...process.stages.map((stage, index) => ({
      id: `stage-${index}`,
      name: `${stage.order}. ${stage.name}`,
      color: '#1d4ed8',
    })),
    ...process.stages.map((stage, index) => ({
      id: `dq-stage-${index}`,
      name: `Descalificados ${stage.order}. ${stage.name}`,
      color: '#dc2626',
    })),
  ]

  const links: LeadsFlowLinkInput[] = []

  if (reachedCounts[0] > 0) {
    links.push({
      source: 'proc-root',
      target: 'stage-0',
      value: reachedCounts[0],
      realValue: reachedCounts[0],
      percentage: getPercentage(reachedCounts[0], totalLeads),
      label: `${process.name} -> ${process.stages[0].name}`,
      isDisqualified: false,
    })
  }

  for (let index = 0; index < process.stages.length - 1; index += 1) {
    const value = reachedCounts[index + 1] ?? 0
    links.push({
      source: `stage-${index}`,
      target: `stage-${index + 1}`,
      value: toVisibleFlow(value),
      realValue: value,
      percentage: getPercentage(value, reachedCounts[index] ?? totalLeads),
      label: `${process.stages[index].name} -> ${process.stages[index + 1].name}`,
      isDisqualified: false,
    })
  }

  process.stages.forEach((stage, index) => {
    const disqValue = disqualifiedStageCounts[index] ?? 0
    if (disqValue <= 0) return

    links.push({
      source: `stage-${index}`,
      target: `dq-stage-${index}`,
      value: toVisibleFlow(disqValue),
      realValue: disqValue,
      percentage: getPercentage(disqValue, reachedCounts[index] ?? totalLeads),
      label: `${stage.name} -> Descalificados`,
      isDisqualified: true,
    })
  })

  const visibleLinks = links.filter(link => !link.isDisqualified || link.realValue > 0)

  if (visibleLinks.length === 0) {
    return <Empty description='No hay transiciones entre etapas para mostrar' />
  }

  return <LeadsFlowGraph chartInput={{ nodes, links: visibleLinks }} />
}

export default ProcessStagesSankey
