import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { legendNamesContainRange, sortLegendItems } from '../../util/legend.js'
import Bubbles from './Bubbles.jsx'
import LegendItem from './LegendItem.jsx'
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
    eventsWithoutCoordinatesCount,
    orgUnitsWithoutCoordinatesCount,
    url,
    source,
    sourceUrl,
    isPlugin = false,
}) => {
    const showRange = Array.isArray(items) && !legendNamesContainRange(items)
    const getShowRange = (item) =>
        item.isLegendIsolated ? !legendNamesContainRange([item]) : showRange

    return (
        <dl className={styles.legend} data-test="layerlegend">
            {description && (
                <div className={styles.description}>{description}</div>
            )}
            {groups && (
                <div className={styles.group}>
                    {groups.multiple === false ? (
                        <>{groups.list[0].name}</>
                    ) : (
                        <>
                            {groups.label}
                            {groups.list.map(({ id, name }) => (
                                <div key={id}>{name}</div>
                            ))}
                        </>
                    )}
                </div>
            )}
            {unit && items && <div className={styles.unit}>{unit}</div>}
            {bubbles ? (
                <Bubbles {...bubbles} isPlugin={isPlugin} classes={items} />
            ) : (
                Array.isArray(items) && (
                    <table>
                        <tbody>
                            {Array.isArray(items) &&
                                sortLegendItems(items).map((item) => (
                                    <LegendItem
                                        {...item}
                                        showRange={getShowRange(item)}
                                        key={`${item.name ?? ''}-${
                                            item.startValue ?? item.from ?? ''
                                        }-${item.endValue ?? item.to ?? ''}`}
                                    />
                                ))}
                        </tbody>
                    </table>
                )
            )}
            {(typeof eventsWithoutCoordinatesCount === 'number' ||
                typeof orgUnitsWithoutCoordinatesCount === 'number') && (
                <div className={styles.dataQuality}>
                    <div>{i18n.t('Data quality')}:</div>
                    {typeof eventsWithoutCoordinatesCount === 'number' && (
                        <div>
                            {i18n.t('{{count}} event without coordinates', {
                                count: eventsWithoutCoordinatesCount,
                                defaultValue_plural:
                                    '{{count}} events without coordinates',
                            })}
                        </div>
                    )}
                    {typeof orgUnitsWithoutCoordinatesCount === 'number' && (
                        <div>
                            {i18n.t('{{count}} org unit without coordinates', {
                                count: orgUnitsWithoutCoordinatesCount,
                                defaultValue_plural:
                                    '{{count}} org units without coordinates',
                            })}
                        </div>
                    )}
                </div>
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
}

Legend.propTypes = {
    bubbles: PropTypes.shape({
        radiusHigh: PropTypes.number.isRequired,
        radiusLow: PropTypes.number.isRequired,
        color: PropTypes.string,
    }),
    coordinateFields: PropTypes.array,
    description: PropTypes.string,
    eventsWithoutCoordinatesCount: PropTypes.number,
    explanation: PropTypes.array,
    filters: PropTypes.array,
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    isPlugin: PropTypes.bool,
    items: PropTypes.array,
    orgUnitsWithoutCoordinatesCount: PropTypes.number,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    unit: PropTypes.string,
    url: PropTypes.string,
}

export default Legend
