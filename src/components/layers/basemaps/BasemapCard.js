import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import BasemapList from './BasemapList';
import OpacitySlider from '../toolbar/OpacitySlider';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
// import './BasemapCard.css';

const styles = {
    actions: {
        backgroundColor: '#eee',
        height: 32,
    },
    container: {
        paddingBottom: 0,
    },
    headerText: {
        position: 'relative',
        width: 210,
        top: '50%',
        transform: 'translateY(-50%)',
        paddingRight: 0,
    },
    visibility: {
        width: 56,
        height: 56,
        padding: 8,
        position: 'absolute',
        right: 32,
        top: 0,
    },
    body: {
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

    // Icon color: '#757575'

    return (
        <Card
            className="BasemapCard"
            // containerStyle={styles.container}
            // expanded={isExpanded}
            // onExpandChange={toggleBasemapExpand}
        >
            <CardHeader>
                // className="BasemapCard-header"
                // title={name}
                // subtitle={subtitle}
                // showExpandableButton={true}
                // textStyle={styles.headerText}
            >
                <Button
                    style={styles.visibility}
                    onClick={toggleBasemapVisibility}
                    tooltip="Toggle visibility"
                >
                    {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </Button>
            </CardHeader>

            <Collapse in={true} timeout="auto" unmountOnExit>
                <CardContent 
                    // expandable={true} 
                    style={styles.body}
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
