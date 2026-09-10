import { CHART_TYPE_BAR } from '../constants/layers.js'

// Mockup for DHIS2-21461: donut/bar chart markers for thematic chart maps.
// Builds a small standalone SVG string per feature — segments is an array
// of { name, color, value }.

const polarToCartesian = ({ cx, cy, r, angleRad }) => [
    cx + r * Math.cos(angleRad),
    cy + r * Math.sin(angleRad),
]

// SVG path for one donut wedge, start/end as a fraction (0-1) of the circle
const donutWedgePath = ({ start, end, r, r0, cx, cy }) => {
    const a0 = 2 * Math.PI * start - Math.PI / 2
    const a1 = 2 * Math.PI * end - Math.PI / 2
    const largeArc = end - start > 0.5 ? 1 : 0
    const [x0, y0] = polarToCartesian({ cx, cy, r, angleRad: a0 })
    const [x1, y1] = polarToCartesian({ cx, cy, r, angleRad: a1 })
    const [x2, y2] = polarToCartesian({ cx, cy, r: r0, angleRad: a1 })
    const [x3, y3] = polarToCartesian({ cx, cy, r: r0, angleRad: a0 })

    return [
        `M ${x0} ${y0}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${r0} ${r0} 0 ${largeArc} 0 ${x3} ${y3}`,
        'Z',
    ].join(' ')
}

export const buildDonutSvg = (segments, size) => {
    const r = size / 2
    const r0 = r * 0.55
    const positive = segments.filter((s) => s.value > 0)
    const total = positive.reduce((sum, s) => sum + s.value, 0)

    if (!total) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#dcdcdc" /><circle cx="${r}" cy="${r}" r="${r0}" fill="var(--marker-bg, #fff)" /></svg>`
    }

    // A single segment covering everything can't be drawn as an SVG arc
    // (start === end after a full turn), so fall back to plain rings
    if (positive.length === 1) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="${positive[0].color}" /><circle cx="${r}" cy="${r}" r="${r0}" fill="var(--marker-bg, #fff)" /></svg>`
    }

    let offset = 0
    const wedges = positive
        .map((segment) => {
            const path = donutWedgePath({
                start: offset / total,
                end: (offset + segment.value) / total,
                r,
                r0,
                cx: r,
                cy: r,
            })
            offset += segment.value
            return `<path d="${path}" fill="${segment.color}" />`
        })
        .join('')

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${wedges}</svg>`
}

export const buildBarSvg = (segments, size) => {
    const height = size
    const width = size
    const max = Math.max(...segments.map((s) => s.value), 1)
    const gap = 2
    const barWidth = (width - gap * (segments.length + 1)) / segments.length

    const bars = segments
        .map((segment, index) => {
            const barHeight = (Math.max(segment.value, 0) / max) * (height - 4)
            const x = gap + index * (barWidth + gap)
            const y = height - barHeight
            return `<rect x="${x}" y="${y}" width="${Math.max(
                barWidth,
                1
            )}" height="${Math.max(barHeight, 0)}" fill="${segment.color}" />`
        })
        .join('')

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bars}<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="#999" stroke-width="1" /></svg>`
}

// Returns a positioned, clickable DOM element for a maplibre-gl Marker
export const createChartMarkerElement = (chartType, segments, size) => {
    const el = document.createElement('div')
    el.style.cursor = 'pointer'
    el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.4))'
    el.innerHTML =
        chartType === CHART_TYPE_BAR
            ? buildBarSvg(segments, size)
            : buildDonutSvg(segments, size)
    return el
}
