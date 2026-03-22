import { useMemo } from 'react'
import { Empty } from 'antd'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { type Lead } from '../../../Types/api.tsx'

interface LeadsDateProps {
  leads: Lead[]
}

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#475569', '#0ea5e9']

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

const formatDateLabel = (dateKey: string): string => {
  const date = new Date(`${dateKey}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? dateKey
    : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
}

const LeadsDate = ({ leads }: LeadsDateProps) => {
  const chart = useMemo(() => {
    const countsByCampaign = new Map<string, Map<string, number>>()

    leads.forEach(lead => {
      const dateKey = getDateKey(lead.created_at)
      if (!dateKey) return

      const campaign = getCampaignName(lead)
      if (!countsByCampaign.has(campaign)) {
        countsByCampaign.set(campaign, new Map<string, number>())
      }

      const campaignDates = countsByCampaign.get(campaign)!
      campaignDates.set(dateKey, (campaignDates.get(dateKey) ?? 0) + 1)
    })

    const allDateKeys = Array.from(
      new Set(Array.from(countsByCampaign.values()).flatMap(days => Array.from(days.keys())))
    ).sort()

    if (!allDateKeys.length) return null

    const firstDate = new Date(`${allDateKeys[0]}T00:00:00`)
    const lastDate = new Date(`${allDateKeys[allDateKeys.length - 1]}T00:00:00`)
    const fullDateKeys: string[] = []

    for (let cursor = new Date(firstDate); cursor <= lastDate; cursor.setDate(cursor.getDate() + 1)) {
      fullDateKeys.push(cursor.toISOString().slice(0, 10))
    }

    const campaignTotals = Array.from(countsByCampaign.entries())
      .map(([name, dayMap]) => ({
        name,
        total: Array.from(dayMap.values()).reduce((sum, value) => sum + value, 0),
      }))
      .sort((a, b) => b.total - a.total)

    const maxCampaigns = 6
    const visibleCampaignNames = campaignTotals.slice(0, maxCampaigns).map(item => item.name)
    const hiddenCampaignNames = campaignTotals.slice(maxCampaigns).map(item => item.name)

    const series = visibleCampaignNames.map((name, index) => ({
      key: `camp_${index}`,
      name,
      color: PALETTE[index % PALETTE.length],
    }))

    if (hiddenCampaignNames.length > 0) {
      series.push({
        key: 'others',
        name: 'Otras campañas',
        color: '#64748b',
      })
    }

    const rows = fullDateKeys.map(dateKey => {
      const row: Record<string, number | string> = {
        dateKey,
        dateLabel: formatDateLabel(dateKey),
      }

      let total = 0

      series.forEach(item => {
        const value = item.key === 'others'
          ? hiddenCampaignNames.reduce(
            (sum, campaign) => sum + (countsByCampaign.get(campaign)?.get(dateKey) ?? 0),
            0
          )
          : countsByCampaign.get(item.name)?.get(dateKey) ?? 0

        row[item.key] = value
        total += value
      })

      row.total = total
      return row
    })

    return {
      rows,
      series,
    }
  }, [leads])

  return (
    <>
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Leads creados por fecha</h3>
      {!chart && <Empty description='No hay fechas de creación disponibles para graficar' />}

      {chart && (
        <div style={{ width: '100%', height: 340, overflow: 'hidden' }}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chart.rows} margin={{ top: 16, right: 24, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='dateLabel' minTickGap={24} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              {chart.series.map(item => (
                <Line
                  key={item.key}
                  type='monotone'
                  dataKey={item.key}
                  name={item.name}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}

              <Line
                type='monotone'
                dataKey='total'
                name='Total'
                stroke='rgba(17, 24, 39, 0.45)'
                strokeWidth={3}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}

export default LeadsDate
