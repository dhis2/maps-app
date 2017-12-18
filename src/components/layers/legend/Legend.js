import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import LegendItem from './LegendItem';
import './Legend.css';

const Legend = ({ description, period, filters, unit, items, source, sourceUrl, attribution }) => (
    <dl className='Legend'>
        {description &&
            <div className='Legend-description'>{description}</div>
        }
        {period &&
            <div className='Legend-period'>{i18next.t('Period')}: {period}</div>
        }
        {filters &&
            <div className='Legend-filters'>{i18next.t('Filters')}: {filters.join(', ')}</div>
        }
        {unit && items &&
            <div className='Legend-unit'>{unit}</div>
        }
        {items && items.map((item, index) => (
            <LegendItem
                {...item}
                key={`item-${index}`}
            />
        ))}
        {source && (
            <div className='Legend-source'>
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
    unit: PropTypes.string,
    items: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default Legend;
