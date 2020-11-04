import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { CardContent, Collapse } from '@material-ui/core';
import { Card } from '@dhis2/ui';
import LayerCardHeader from '../LayerCardHeader';
import BasemapList from './BasemapList';
import LayerToolbar from '../toolbar/LayerToolbar';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
import styles from './styles/BasemapCard.module.css';

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
    } = props;

    return (
        <div className={styles.card}>
            <Card dataTest="basemapcard">
                <LayerCardHeader
                    title={i18n.t(name)}
                    subtitle={subtitle}
                    isExpanded={isExpanded}
                    toggleExpand={toggleBasemapExpand}
                />

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <CardContent
                        className={styles.content}
                        style={{ padding: 0 }}
                    >
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
        </div>
    );
};

BasemapCard.propTypes = {
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
)(BasemapCard);
