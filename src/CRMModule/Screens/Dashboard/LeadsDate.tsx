import { useEffect, useMemo, useRef, useState } from 'react'
import { Empty, Space, Tag } from 'antd'
import { curveMonotoneX, extent, line, max, scaleLinear, scaleTime, timeFormat } from 'd3'

import { type Lead } from '../../../Types/api.tsx'

interface LeadsDateProps {
  leads: Lead[]
}

const getCampaignName = (lead: Lead): string => {
  const campaignName = lead.campaign?.name?.trim()
  return campaignName && campaignName.length > 0 ? campaignName : 'Sin campaña'
}

const getDateKey = (createdAt?: string | null): string | null => {
  if (!createdAt) return null
  if (createdAt.length >= 10 && createdAt.includes('-')) return createdAt.slice(0, 10)
  const parsed = new Date(createdAt)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

const LeadsDate = ({ leads }: LeadsDateProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(1000)

  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (!containerRef.current) return
      setContainerWidth(containerRef.current.clientWidth || 1000)
    }

    updateWidth()
    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const chart = useMemo(() => {
    const countsByCampaign = new Map<string, Map<string, number>>()
    leads.forEach(lead => {
      const key = getDateKey(lead.created_at)
      if (!key) return
      const campaign = getCampaignName(lead)
      if (!countsByCampaign.has(campaign)) {
        countsByCampaign.set(campaign, new Map<string, number>())
      }
      const campaignMap = countsByCampaign.get(campaign)!
      campaignMap.set(key, (campaignMap.get(key) ?? 0) + 1)
    })

    const allDateKeys = Array.from(
      new Set(
        Array.from(countsByCampaign.values()).flatMap(dayMap => Array.from(dayMap.keys()))
      )
    ).sort()

    if (!allDateKeys.length) return null

    const firstDate = new Date(`${allDateKeys[0]}T00:00:00`)
    const lastDate = new Date(`${allDateKeys[allDateKeys.length - 1]}T00:00:00`)
    const fullDateKeys: string[] = []
    for (let cursor = new Date(firstDate); cursor <= lastDate; cursor.setDate(cursor.getDate() + 1)) {
      fullDateKeys.push(cursor.toISOString().slice(0, 10))
    }

    const palette = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#475569', '#0ea5e9']
    const campaignTotals = Array.from(countsByCampaign.entries())
      .map(([name, dayMap]) => ({
        name,
        total: Array.from(dayMap.values()).reduce((sum, value) => sum + value, 0),
      }))
      .sort((a, b) => b.total - a.total)

    const maxCampaigns = 6
    const visibleCampaignNames = campaignTotals.slice(0, maxCampaigns).map(item => item.name)
    const hiddenCampaignNames = campaignTotals.slice(maxCampaigns).map(item => item.name)

    const campaignSeries = visibleCampaignNames.map((campaign, index) => {
      const campaignMap = countsByCampaign.get(campaign)!
      return {
        id: campaign,
        name: campaign,
        color: palette[index % palette.length],
        points: fullDateKeys.map(dateKey => ({
          date: new Date(`${dateKey}T00:00:00`),
          value: campaignMap.get(dateKey) ?? 0,
        })),
      }
    })

    if (hiddenCampaignNames.length > 0) {
      campaignSeries.push({
        id: '__others__',
        name: 'Otras campañas',
        color: '#64748b',
        points: fullDateKeys.map(dateKey => ({
          date: new Date(`${dateKey}T00:00:00`),
          value: hiddenCampaignNames.reduce(
            (sum, campaign) => sum + (countsByCampaign.get(campaign)?.get(dateKey) ?? 0),
            0
          ),
        })),
      })
    }

    const totalSeries = {
      id: '__total__',
      name: 'Total',
      color: '#111827',
      points: fullDateKeys.map(dateKey => ({
        date: new Date(`${dateKey}T00:00:00`),
        value: campaignSeries.reduce(
          (sum, series) => sum + (series.points.find(p => p.date.toISOString().slice(0, 10) === dateKey)?.value ?? 0),
          0
        ),
      })),
    }

    const width = Math.max(360, containerWidth)
    const height = width < 640 ? 260 : 320
    const margin = { top: 16, right: 16, bottom: 36, left: 44 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const [minDate, maxDate] = extent(totalSeries.points, d => d.date) as [Date, Date]
    const maxValue = max(totalSeries.points, d => d.value) ?? 1

    const x = scaleTime().domain([minDate, maxDate]).range([margin.left, margin.left + innerWidth])
    const y = scaleLinear().domain([0, maxValue]).nice().range([margin.top + innerHeight, margin.top])

    const totalLine = line<{ date: Date; value: number }>()
      .curve(curveMonotoneX)
      .x(d => x(d.date))
      .y(d => y(d.value))(totalSeries.points) || ''

    const stackedRows = totalSeries.points.map(point => {
      let cursor = 0
      const dateKey = point.date.toISOString().slice(0, 10)
      const segments = campaignSeries.map(series => {
        const value = series.points.find(p => p.date.toISOString().slice(0, 10) === dateKey)?.value ?? 0
        const y0 = cursor
        cursor += value
        return { id: series.id, name: series.name, color: series.color, value, y0, y1: cursor }
      })
      return { date: point.date, segments }
    })

    const xCoords = totalSeries.points.map(point => x(point.date))
    const minDelta = xCoords.length > 1
      ? xCoords.slice(1).reduce((minGap, value, index) => Math.min(minGap, value - xCoords[index]), Number.POSITIVE_INFINITY)
      : innerWidth
    const barWidth = Math.max(3, Math.min(18, minDelta * 0.7))

    const xTicks = x.ticks(Math.min(6, totalSeries.points.length))
    const yTicks = y.ticks(5)
    const xLabel = timeFormat('%d/%m')

    return { width, height, campaignSeries, totalSeries, stackedRows, totalLine, barWidth, x, y, xTicks, yTicks, xLabel }
  }, [leads, containerWidth])

  return (
    <>
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Leads creados por fecha</h3>
      {!chart && <Empty description='No hay fechas de creación disponibles para graficar' />}
      {chart && (
        <>
          <div ref={containerRef} style={{ width: '100%', height: chart.height, overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} style={{ width: '100%', height: '100%' }}>
              {chart.yTicks.map((tick, index) => (
                <g key={`y-tick-${index}`}>
                  <line x1={44} x2={chart.width - 16} y1={chart.y(tick)} y2={chart.y(tick)} stroke='#e5e7eb' strokeWidth={1} />
                  <text x={38} y={chart.y(tick)} textAnchor='end' dominantBaseline='middle' fontSize={10} fill='#6b7280'>
                    {tick}
                  </text>
                </g>
              ))}

              {chart.xTicks.map((tick, index) => (
                <g key={`x-tick-${index}`}>
                  <line x1={chart.x(tick)} x2={chart.x(tick)} y1={16} y2={chart.height - 36} stroke='#f3f4f6' strokeWidth={1} />
                  <text x={chart.x(tick)} y={chart.height - 20} textAnchor='middle' fontSize={10} fill='#6b7280'>
                    {chart.xLabel(tick)}
                  </text>
                </g>
              ))}

              {chart.stackedRows.map((row, rowIndex) => (
                <g key={`row-${rowIndex}`}>
                  {row.segments.map(segment => (
                    segment.value > 0 ? (
                      <rect
                        key={`${rowIndex}-${segment.id}`}
                        x={chart.x(row.date) - chart.barWidth / 2}
                        y={chart.y(segment.y1)}
                        width={chart.barWidth}
                        height={Math.max(1, chart.y(segment.y0) - chart.y(segment.y1))}
                        fill={segment.color}
                        fillOpacity={0.9}
                      >
                        <title>{`${segment.name} ${chart.xLabel(row.date)}: ${segment.value} leads`}</title>
                      </rect>
                    ) : null
                  ))}
                </g>
              ))}

              <path d={chart.totalLine} fill='none' stroke='#111827' strokeWidth={2.5} />
              {chart.totalSeries.points.map((point, index) => (
                <circle key={`total-point-${index}`} cx={chart.x(point.date)} cy={chart.y(point.value)} r={2.4} fill='#111827'>
                  <title>{`Total ${chart.xLabel(point.date)}: ${point.value} leads`}</title>
                </circle>
              ))}
            </svg>
          </div>
          <Space wrap style={{ marginTop: 8 }}>
            <Tag color='default'>Total</Tag>
            {chart.campaignSeries.map(series => (
              <Tag key={`legend-${series.id}`} color='processing'>
                {series.name}
              </Tag>
            ))}
          </Space>
        </>
      )}
    </>
  )
}

export default LeadsDate
