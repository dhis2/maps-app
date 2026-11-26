import PropTypes from 'prop-types'
import React from 'react'
import { RENDERER_GEOMETRY, RENDERER_ICON } from '../../constants/dataTable.js'
import { formatCellText } from '../../util/tableCells.js'
import GeometrySymbol from './GeometrySymbol.jsx'
import LegendSymbol from './LegendSymbol.jsx'
import styles from './styles/DataTable.module.css'

const CellValue = ({
    value,
    renderer,
    type,
    legendSymbol,
    orgUnitIdToName,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (renderer === RENDERER_ICON) {
        if (value) {
            return (
                <img
                    className={styles.iconCell}
                    src={value}
                    alt=""
                    onError={(e) => {
                        e.target.style.visibility = 'hidden'
                    }}
                />
            )
        }
        // Unclassified facilities are drawn as a dot instead of an icon
        return legendSymbol?.color ? (
            <span
                className={styles.iconDot}
                style={{ backgroundColor: legendSymbol.color }}
            />
        ) : null
    }

    const text = formatCellText(value, {
        renderer,
        type,
        orgUnitIdToName,
        keyAnalysisDigitGroupSeparator,
    })
    if (renderer === RENDERER_GEOMETRY && text) {
        return (
            <>
                <GeometrySymbol type={value} className={styles.geometry} />
                {text}
            </>
        )
    }
    if (!legendSymbol || !text) {
        return text
    }
    return (
        <>
            <LegendSymbol {...legendSymbol} />
            {text}
        </>
    )
}

CellValue.propTypes = {
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    legendSymbol: PropTypes.shape({
        color: PropTypes.string,
        iconUrl: PropTypes.string,
    }),
    orgUnitIdToName: PropTypes.instanceOf(Map),
    renderer: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),
}

export default CellValue
