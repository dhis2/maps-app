import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Tooltip from '@material-ui/core/Tooltip';
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
    },
    actions: {
        backgroundColor: '#eee',
        height: 32,
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
    content: { // TODO: Not working on :last-child
        padding: 0,
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
        <Card className={classes.card}>
            <CardHeader
                classes={{
                    root: classes.header,
                    title: classes.title,
                    subheader: classes.subheader,
                }}
                title={name}
                subheader={subtitle}
                action={
                    <Tooltip key="expand" title={i18n.t('Collapse')}>
                        <IconButton
                            className={classes.expand}
                            onClick={toggleBasemapExpand}
                            tooltip={isExpanded ? i18n.t('Collapse') : i18n.t('Expand')}
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                        layerType="basemap"
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
