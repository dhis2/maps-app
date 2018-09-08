import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Tooltip from '@material-ui/core/Tooltip';
import BasemapList from './BasemapList';
import OpacitySlider from '../toolbar/OpacitySlider';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
// import './BasemapCard.css'; // TODO: Delete file

const styles = {
    card: {
        margin: '8px 4px 8px 4px',
        paddingBottom: 0,
    },
    header: {
        height: 56,
        padding: '0 8px 0 18px',
        // background: 'yellow',
        fontSize: 14,
    },
    title: {
        width: 210,
        fontSize: 15,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 500,
    },
    actions: {
        backgroundColor: '#eee',
        height: 32,
    },
    visibility: {
        position: 'absolute',
        right: 32,
        top: 10,
    },
    expand: {
        position: 'absolute',
        right: 0,
        top: 10,
    },
    content: { // TODO: Not working on :last-child
        padding: 0,
    },
};

// Basemap card shown in left layers panel
const BasemapCard = props => {
    const {
        name,
        subtitle,
        opacity,
        isExpanded,
        isVisible,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
        classes
    } = props;

    return (
        <Card className={classes.card}>
            <CardHeader
                classes={{ 
                    root: classes.header,
                    title: classes.title,
                }}
                title={name}
                subheader={subtitle}
                action={[
                    <Tooltip 
                        key="visibility" 
                        title={i18n.t('Toggle visibility')}
                    >
                        <IconButton
                            className={classes.visibility}
                            onClick={toggleBasemapVisibility}
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                    </Tooltip>,
                    <Tooltip 
                        key="expand" 
                        title={i18n.t('Collapse')}
                    >
                        <IconButton
                            className={classes.expand}
                            onClick={toggleBasemapExpand}
                            tooltip={isExpanded ? i18n.t('Collapse') : i18n.t('Expand')}
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Tooltip>,
                ]}
            />

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent 
                    className={classes.content}
                    style={{ padding: 0 }}
                >
                    <BasemapList {...props} />
                    <CardActions className={classes.actions}>
                        <OpacitySlider
                            opacity={opacity}
                            onChange={opacity => changeBasemapOpacity(opacity)}
                        />
                    </CardActions>
                </CardContent>
            </Collapse>
        </Card>
    );
};

BasemapCard.propTypes = {
    name: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    opacity: PropTypes.number,
    isVisible: PropTypes.bool,
    isExpanded: PropTypes.bool,
    toggleBasemapExpand: PropTypes.func.isRequired,
    toggleBasemapVisibility: PropTypes.func.isRequired,
    changeBasemapOpacity: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
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
