import {useEffect, useMemo, useRef, useState} from 'react'
import {sankey as d3Sankey, sankeyLeft, sankeyLinkHorizontal} from 'd3-sankey'

export interface LeadsFlowNodeInput {
  id: string
  name: string
  color: string
}

export interface LeadsFlowLinkInput {
  source: string
  target: string
  value: number
  realValue: number
  percentage: number
  label: string
  isDisqualified: boolean
}

interface LeadsFlowGraphProps {
  chartInput: {
    nodes: LeadsFlowNodeInput[]
    links: LeadsFlowLinkInput[]
  }
}

const LeadsFlowGraph = ({chartInput}: LeadsFlowGraphProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(1000)
  const [animationKey, setAnimationKey] = useState(0)

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

  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [chartInput])

  const sankeyLayout = useMemo(() => {
    const width = Math.max(360, containerWidth)
    const height = width < 640 ? 420 : 560
    const rightPadding = width < 640 ? 120 : 260

    const generator = d3Sankey<any, any>()
      .nodeId((d: any) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(10)
      .nodePadding(20)
      .extent([[20, 20], [Math.max(220, width - rightPadding), height - 20]])

    const graph = generator({
      nodes: chartInput.nodes.map(node => ({...node})),
      links: chartInput.links.map(link => ({...link})),
    } as any)
    const linkPath = sankeyLinkHorizontal()

    return {
      width,
      height,
      nodes: graph.nodes as any[],
      links: graph.links as any[],
      linkPath,
    }
  }, [chartInput, containerWidth])

  return (
    <div ref={containerRef} style={{height: sankeyLayout.height, overflow: 'hidden'}}>
      <svg viewBox={`0 0 ${sankeyLayout.width} ${sankeyLayout.height}`}
           style={{width: '100%', height: '100%'}}>
        {sankeyLayout.links.map((link, index) => {
          const d = sankeyLayout.linkPath(link)
          const stroke = link.isDisqualified ? '#dc2626' : '#94a3b8'
          const begin = `${(index * 0.035).toFixed(3)}s`
          const labelX = (Number(link.source.x1) + Number(link.target.x0)) / 2
          const labelY = (Number(link.y0) + Number(link.y1)) / 2

          return (
            <g key={`link-${animationKey}-${index}`}>
              <path
                d={d || ''}
                fill='none'
                stroke={stroke}
                strokeOpacity={0.3}
                strokeWidth={link.width}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
              >
                <animate
                  attributeName='stroke-dashoffset'
                  from='1'
                  to='0'
                  dur='0.55s'
                  begin={begin}
                  fill='freeze'
                />
                <animate
                  attributeName='opacity'
                  from='0'
                  to='1'
                  dur='0.25s'
                  begin={begin}
                  fill='freeze'
                />
                <title>{`${link.label}: ${link.realValue} (${link.percentage}%)`}</title>
              </path>
              <text
                x={labelX}
                y={labelY}
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize={10}
                fill={link.isDisqualified ? '#b91c1c' : '#0f172a'}
              >
                {new Intl.NumberFormat('es-PE').format(Number(link.realValue || 0))}
              </text>
            </g>
          )
        })}
        {sankeyLayout.nodes.map((node, index) => {
          const textX = Number(node.x1) + 8
          const textY = Number(node.y0) + Math.max((Number(node.y1) - Number(node.y0)) / 2, 8)
          const height = Math.max(1, Number(node.y1) - Number(node.y0))

          return (
            <g key={`node-${animationKey}-${index}`} opacity={0}>
              <animate
                attributeName='opacity'
                from='0'
                to='1'
                dur='0.35s'
                begin={`${(index * 0.04).toFixed(3)}s`}
                fill='freeze'
              />
              <animateTransform
                attributeName='transform'
                type='translate'
                from='-8 0'
                to='0 0'
                dur='0.35s'
                begin={`${(index * 0.04).toFixed(3)}s`}
                fill='freeze'
              />
              <rect
                x={node.x0}
                y={node.y0}
                width={Math.max(1, Number(node.x1) - Number(node.x0))}
                height={height}
                fill={node.color || '#1d4ed8'}
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
  )
}

export default LeadsFlowGraph
