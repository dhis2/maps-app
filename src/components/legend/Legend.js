import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Bubbles from './Bubbles';
import LegendItem from './LegendItem';
import styles from './styles/Legend.module.css';

// Rendering a layer legend in the left drawer, on a map (download) or in a control (plugin)
const Legend = ({
    description,
    filters,
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
                {groups.length > 1 ? i18n.t('Groups') : i18n.t('Group')}:
                {groups.map(group => (
                    <div key={group}>{group}</div>
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
        {Array.isArray(filters) && (
            <div className={styles.filters}>
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
);

Legend.propTypes = {
    description: PropTypes.string,
    filters: PropTypes.array,
    groups: PropTypes.array,
    unit: PropTypes.string,
    items: PropTypes.array,
    bubbles: PropTypes.shape({
        radiusLow: PropTypes.number.isRequired,
        radiusHigh: PropTypes.number.isRequired,
        color: PropTypes.string,
    }),
    url: PropTypes.string,
    explanation: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default Legend;
