import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/GroupStyle.module.css'

const GroupStyle = ({ name, color, symbol, styleType }) => {
    const { baseUrl } = useConfig()
    const imagePath = `${baseUrl}/images/orgunitgroup/`
    const useColor = styleType !== 'SYMBOL'

    return (
        <div className={styles.item}>
            {useColor ? (
                <span
                    className={styles.color}
                    style={{
                        backgroundColor: color,
                    }}
                />
            ) : (
                <span
                    className={styles.symbol}
                    style={{
                        backgroundImage:
                            imagePath && symbol
                                ? `url(${imagePath}${symbol})`
                                : 'none',
                    }}
                />
            )}
            <span className={styles.label}>{name}</span>
        </div>
    )
}

GroupStyle.propTypes = {
    color: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    styleType: PropTypes.string.isRequired,
    symbol: PropTypes.string,
}

export default GroupStyle
