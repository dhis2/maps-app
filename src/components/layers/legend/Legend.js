import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import LegendItem from './LegendItem';
import './Legend.css';

const Legend = ({ description, filters, unit, items, source, sourceUrl }) => (
    <dl className="Legend">
        {description && <div className="Legend-description">{description}</div>}
        {filters && (
            <div className="Legend-filters">
                {i18n.t('Filters')}: {filters.join(', ')}
            </div>
        )}
        {unit && items && <div className="Legend-unit">{unit}</div>}
        {items && (
            <table>
                <tbody>
                    {items.map((item, index) => (
                        <LegendItem {...item} key={`item-${index}`} />
                    ))}
                </tbody>
            </table>
        )}
        {source && (
            <div className="Legend-source">
                Source:&nbsp;
                {sourceUrl ? (
                    <a href={sourceUrl}>{source}</a>
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
    unit: PropTypes.string,
    items: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default Legend;
