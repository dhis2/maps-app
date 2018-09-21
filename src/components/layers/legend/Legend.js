import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import LegendItem from './LegendItem';
import legendStyle from './legendStyle';

export const styles = {
    legend: {
        ...legendStyle,
    },
    description: {
        paddingBottom: 12,
    },
    period: {
        paddingBottom: 12,
    },
    filters: {
        paddingBottom: 12,
    },
    unit: {
        marginLeft: 32,
        lineHeight: '24px',
    },
    source: {
        paddingTop: 16,
        fontSize: 12,
    },
};

const Legend = ({
    classes,
    description,
    filters,
    unit,
    items,
    source,
    sourceUrl,
}) => (
    <dl className={classes.legend}>
        {description && (
            <div className={classes.description}>{description}</div>
        )}
        {filters && (
            <div className={classes.filters}>
                {i18n.t('Filters')}: {filters.join(', ')}
            </div>
        )}
        {unit && items && <div className={classes.unit}>{unit}</div>}
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
            <div className={classes.source}>
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
    classes: PropTypes.object.isRequired,
    description: PropTypes.string,
    filters: PropTypes.array,
    unit: PropTypes.string,
    items: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default withStyles(styles)(Legend);
