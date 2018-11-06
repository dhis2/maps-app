import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import LegendItem from './LegendItem';
import legendStyle from './legendStyle';

export const styles = theme => ({
    legend: {
        ...legendStyle,
    },
    description: {
        paddingBottom: theme.spacing.unit * 1.5,
    },
    period: {
        paddingBottom: theme.spacing.unit * 1.5,
    },
    filters: {
        paddingBottom: theme.spacing.unit * 1.5,
    },
    unit: {
        marginLeft: theme.spacing.unit * 4,
        lineHeight: '24px',
    },
    explanation: {
        paddingTop: theme.spacing.unit * 2,
    },
    source: {
        paddingTop: theme.spacing.unit * 2,
        fontSize: 12,
    },
});

// Rendering a layer legend in the left drawer, on a map (download) or in a control (plugin)
const Legend = ({
    classes,
    description,
    filters,
    unit,
    items,
    explanation,
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
        {explanation && (
            <div className={classes.explanation}>{explanation}</div>
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
    explanation: PropTypes.string,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default withStyles(styles)(Legend);
