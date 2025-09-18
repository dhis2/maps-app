import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import Bubbles from './Bubbles.js'
import LegendItem from './LegendItem.js'
import styles from './styles/Legend.module.css'

// Rendering a layer legend in the left drawer, on a map (download) or in a control (plugin)
const Legend = ({
    description,
    filters,
    coordinateFields,
    groups,
    unit,
    items,
    bubbles,
    explanation,
    url,
    source,
    sourceUrl,
}) => (
    <dl className={styles.legend} data-test="layerlegend">
        {description && <div className={styles.description}>{description}</div>}
        {groups && (
            <div className={styles.group}>
                {groups.length > 1 ? i18n.t('Groups') : i18n.t('Group')}
                {groups.map(({ id, name }) => (
                    <div key={id}>{name}</div>
                ))}
            </div>
        )}
        {unit && items && <div className={styles.unit}>{unit}</div>}
        {bubbles ? (
            <Bubbles {...bubbles} classes={items} />
        ) : (
            Array.isArray(items) && (
                <table>
                    <tbody>
                        {items.map((item, index) => (
                            <LegendItem {...item} key={`item-${index}`} />
                        ))}
                    </tbody>
                </table>
            )
        )}
        {url && <img className={styles.legendImage} src={url} />}
        {Array.isArray(coordinateFields) && (
            <div className={styles.coordinateFields}>
                <div>{i18n.t('Coordinate field')}:</div>
                {coordinateFields.map((coordinateField, index) => (
                    <div key={index}>{coordinateField}</div>
                ))}
            </div>
        )}
        {Array.isArray(filters) && (
            <div className={styles.filters} data-test="layerlegend-filters">
                <div>{i18n.t('Filters')}:</div>
                {filters.map((filter, index) => (
                    <div key={index}>{filter}</div>
                ))}
            </div>
        )}
        {Array.isArray(explanation) && (
            <div className={styles.explanation}>
                {explanation.map((expl, index) => (
                    <div key={index}>{expl}</div>
                ))}
            </div>
        )}
        {source && (
            <div className={styles.source}>
                {i18n.t('Source')}:&nbsp;
                {sourceUrl ? (
                    <a href={sourceUrl} target="_blank" rel="noreferrer">
                        {source}
                    </a>
                ) : (
                    <span>{source}</span>
                )}
            </div>
        )}
    </dl>
)

Legend.propTypes = {
    bubbles: PropTypes.shape({
        radiusHigh: PropTypes.number.isRequired,
        radiusLow: PropTypes.number.isRequired,
        color: PropTypes.string,
    }),
    coordinateFields: PropTypes.array,
    description: PropTypes.string,
    explanation: PropTypes.array,
    filters: PropTypes.array,
    groups: PropTypes.array,
    items: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    unit: PropTypes.string,
    url: PropTypes.string,
}

export default Legend
