import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import SortableHandle from './SortableHandle';
import OverlayToolbar from '../toolbar/OverlayToolbar';
import Legend from '../legend/Legend';
import { editOverlay, removeOverlay, changeOverlayOpacity, toggleOverlayExpand, toggleOverlayVisibility } from '../../../actions/overlays';
import { toggleDataTable } from '../../../actions/dataTable';
import './OverlayCard.css';


const styles = {
    container: {
        paddingBottom: 0,
    },
    headerText: {
        position: 'relative',
        width: 200,
        top: '50%',
        left: 16,
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

const OverlayCard = (props) => {
    const {
        layer,
        editOverlay,
        removeOverlay,
        changeOverlayOpacity,
        toggleOverlayExpand,
        toggleOverlayVisibility,
        toggleDataTable,
    } = props;

    const {
        id,
        title,
        subtitle,
        isExpanded,
        isVisible,
        legend,
    } = layer;

    return (
        <Card
            className='OverlayCard'
            containerStyle={styles.container}
            expanded={isExpanded}
            onExpandChange={() => toggleOverlayExpand(id)}
        >
            <CardHeader
                className='OverlayCard-header'
                title={title}
                subtitle={subtitle}
                showExpandableButton={true}
                textStyle={styles.headerText}
            >
                <SortableHandle color={grey600} />
                <IconButton
                    style={styles.visibility}
                    onClick={() => toggleOverlayVisibility(id)}
                    tooltip="Toggle visibility">
                    <SvgIcon
                        icon={isVisible ? 'Visibility' : 'VisibilityOff'}
                        color={grey600}
                    />
                </IconButton>
            </CardHeader>
            <CardText expandable={true} style={styles.body}>
                {legend && <Legend {...legend} />}
                <OverlayToolbar
                    layer={layer}
                    onEdit={() => editOverlay(layer)}
                    toggleDataTable={toggleDataTable}
                    onOpacityChange={changeOverlayOpacity}
                    onRemove={() => removeOverlay(id)}
                />
            </CardText>
        </Card>
    )
};

OverlayCard.propTypes = {
    layer: PropTypes.object,
    editOverlay: PropTypes.func.isRequired,
    removeOverlay: PropTypes.func.isRequired,
    changeOverlayOpacity: PropTypes.func.isRequired,
    toggleOverlayExpand: PropTypes.func.isRequired,
    toggleOverlayVisibility: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
};

export default connect(
    null,
    { editOverlay, removeOverlay, changeOverlayOpacity, toggleOverlayExpand, toggleOverlayVisibility, toggleDataTable }
)(OverlayCard);
