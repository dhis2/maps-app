import PropTypes from 'prop-types'
import React from 'react'
import { RENDERER_GEOMETRY, RENDERER_ICON } from '../../constants/dataTable.js'
import { formatCellText } from '../../util/tableCells.js'
import GeometrySymbol from './GeometrySymbol.jsx'
import styles from './styles/DataTable.module.css'

const CellValue = ({
    value,
    renderer,
    type,
    swatch,
    orgUnitIdToName,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (renderer === RENDERER_ICON) {
        return value ? (
            <img
                className={styles.iconCell}
                src={value}
                alt=""
                onError={(e) => {
                    e.target.style.visibility = 'hidden'
                }}
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
    if (!swatch || !text) {
        return text
    }
    return (
        <>
            <span
                className={styles.swatch}
                style={{ backgroundColor: swatch }}
            />
            {text}
        </>
    )
}

CellValue.propTypes = {
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    orgUnitIdToName: PropTypes.instanceOf(Map),
    renderer: PropTypes.string,
    swatch: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),
}

export default CellValue
