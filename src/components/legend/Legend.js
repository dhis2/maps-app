import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Bubbles from './Bubbles';
import LegendItem from './LegendItem';
import legendStyle from './legendStyle';

export const styles = theme => ({
    legend: {
        ...legendStyle,
    },
    description: {
        paddingBottom: theme.spacing(1.5),
    },
    period: {
        paddingBottom: theme.spacing(1.5),
    },
    filters: {
        paddingTop: theme.spacing(2),
        fontSize: 12,
        '& > div:first-child': {
            fontWeight: 'bold',
        },
    },
    unit: {
        lineHeight: '24px',
        fontWeight: 'bold',
    },
    explanation: {
        paddingTop: theme.spacing(2),
    },
    source: {
        paddingTop: theme.spacing(2),
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
    bubbles,
    explanation,
    source,
    sourceUrl,
}) => (
    <dl className={classes.legend} data-test="layerlegend">
        {description && (
            <div className={classes.description}>{description}</div>
        )}
        {unit && items && <div className={classes.unit}>{unit}</div>}
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
        {Array.isArray(filters) && (
            <div className={classes.filters}>
                <div>{i18n.t('Filters')}:</div>
                {filters.map((filter, index) => (
                    <div key={index}>{filter}</div>
                ))}
            </div>
        )}
        {Array.isArray(explanation) && (
            <div className={classes.explanation}>
                {explanation.map((expl, index) => (
                    <div key={index}>{expl}</div>
                ))}
            </div>
        )}
        {source && (
            <div className={classes.source}>
                {i18n.t('Source')}:&nbsp;
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
    bubbles: PropTypes.shape({
        radiusLow: PropTypes.number.isRequired,
        radiusHigh: PropTypes.number.isRequired,
        color: PropTypes.string,
    }),
    explanation: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
};

export default withStyles(styles)(Legend);
