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

const splitLongWord = (word: string, maxChars: number): string[] => {
  if (word.length <= maxChars) return [word]
  const chunks: string[] = []
  for (let index = 0; index < word.length; index += maxChars) {
    chunks.push(word.slice(index, index + maxChars))
  }
  return chunks
}

const truncateWithEllipsis = (line: string, maxChars: number): string => {
  if (line.length <= maxChars) return line
  return `${line.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
}

const wrapLabelByWidth = (text: string, maxWidthPx: number, maxLines = 3): string[] => {
  const safeWidth = Math.max(40, maxWidthPx)
  const avgCharWidthPx = 6.1
  const maxChars = Math.max(6, Math.floor(safeWidth / avgCharWidthPx))
  const words = text
    .trim()
    .split(/\s+/)
    .flatMap(word => splitLongWord(word, maxChars))

  if (!words.length) return ['']

  const lines: string[] = []
  let current = ''

  words.forEach(word => {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
      return
    }

    if (current) {
      lines.push(current)
      current = word
      return
    }

    lines.push(word)
  })

  if (current) {
    lines.push(current)
  }

  if (lines.length <= maxLines) {
    return lines
  }

  const visible = lines.slice(0, maxLines)
  visible[maxLines - 1] = truncateWithEllipsis(visible[maxLines - 1], maxChars)
  return visible
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

    const generator = d3Sankey<any, any>()
      .nodeId((d: any) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(10)
      .nodePadding(20)
      .extent([[20, 20], [Math.max(220, width - 20), height - 20]])

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
              </path>
            </g>
          )
        })}
        {sankeyLayout.nodes.map((node, index) => {
          const isNearLeftEdge = Number(node.x0) < 170
          const textX = isNearLeftEdge ? Number(node.x1) + 8 : Number(node.x0) - 8
          const textAnchor = isNearLeftEdge ? 'start' : 'end'
          const textY = Number(node.y0) + Math.max((Number(node.y1) - Number(node.y0)) / 2, 8)
          const height = Math.max(1, Number(node.y1) - Number(node.y0))
          const nodeCount = new Intl.NumberFormat('es-PE').format(Number(node.value || 0))
          const availableLabelWidth = isNearLeftEdge
            ? Math.max(56, sankeyLayout.width - textX - 12)
            : Math.max(56, textX - 12)
          const constrainedLabelWidth = Math.min(160, availableLabelWidth)
          const labelLines = wrapLabelByWidth(String(node.name || ''), constrainedLabelWidth)
          const firstLabelOffset = index === 0 ? 1.5 : 0
          const titleDy = `${(-0.4 - ((labelLines.length - 1) * 0.58) - firstLabelOffset).toFixed(2)}em`

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
              <text x={textX} y={textY} textAnchor={textAnchor} fill='var(--text-title-color)' dominantBaseline='middle'>
                {labelLines.map((line, lineIndex) => (
                  <tspan
                    key={`node-${index}-label-${lineIndex}`}
                    x={textX}
                    dy={lineIndex === 0 ? titleDy : '1.15em'}
                    fontSize={11}
                  >
                    {line}
                  </tspan>
                ))}
                <tspan x={textX} dy='1.35em' fontSize={14} fontWeight={700}>
                  {nodeCount}
                </tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default LeadsFlowGraph
