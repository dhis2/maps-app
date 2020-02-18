import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    CardHeader,
    CardContent,
    Collapse,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import ExpandIcon from '@material-ui/icons/ExpandMore';
import CollapseIcon from '@material-ui/icons/ExpandLess';
import BasemapList from './BasemapList';
import LayerToolbar from '../toolbar/LayerToolbar';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';

const styles = {
    card: {
        position: 'relative',
        margin: '8px 4px 8px 4px',
        paddingBottom: 0,
    },
    header: {
        height: 54,
        padding: '2px 8px 0 18px',
        fontSize: 14,
    },
    title: {
        width: 242,
        fontSize: 15,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 500,
        lineHeight: '17px',
    },
    subheader: {
        lineHeight: '17px',
        fontSize: 14,
    },
    visibility: {
        height: 32,
        width: 32,
        padding: 4,
    },
    expand: {
        position: 'absolute',
        right: -4,
        top: 4,
    },
    content: {
        padding: 0,
    },
    tooltip: {
        marginTop: -8,
    },
};

// Basemap card shown in left layers panel
const BasemapCard = props => {
    const {
        name,
        subtitle = i18n.t('Basemap'),
        opacity,
        isExpanded,
        isVisible,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
        classes,
    } = props;

    return (
        <Card className={classes.card} data-test="basemapcard">
            <CardHeader
                classes={{
                    root: classes.header,
                    title: classes.title,
                    subheader: classes.subheader,
                }}
                title={name}
                subheader={subtitle}
                action={
                    <Tooltip
                        title={
                            isExpanded ? i18n.t('Collapse') : i18n.t('Expand')
                        }
                        classes={{
                            tooltipPlacementBottom: classes.tooltip,
                        }}
                    >
                        <IconButton
                            className={classes.expand}
                            onClick={toggleBasemapExpand}
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                    </Tooltip>
                }
            />

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent className={classes.content} style={{ padding: 0 }}>
                    <BasemapList
                        selectedID={props.basemap.id}
                        basemaps={props.basemaps}
                        selectBasemap={props.selectBasemap}
                    />
                    <LayerToolbar
                        opacity={opacity}
                        isVisible={isVisible}
                        onOpacityChange={changeBasemapOpacity}
                        toggleLayerVisibility={toggleBasemapVisibility}
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

BasemapCard.propTypes = {
    classes: PropTypes.object.isRequired,

    name: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    opacity: PropTypes.number,
    isVisible: PropTypes.bool,
    isExpanded: PropTypes.bool,

    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,

    changeBasemapOpacity: PropTypes.func.isRequired,
    toggleBasemapExpand: PropTypes.func.isRequired,
    toggleBasemapVisibility: PropTypes.func.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

BasemapCard.defaultProps = {
    opacity: 1,
    isVisible: true,
    isExpanded: true,
};

export default connect(
    state => ({
        basemap: state.map.basemap, // Selected basemap
        basemaps: state.basemaps, // All basemaps
    }),
    {
        changeBasemapOpacity,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        selectBasemap,
    }
)(withStyles(styles)(BasemapCard));
