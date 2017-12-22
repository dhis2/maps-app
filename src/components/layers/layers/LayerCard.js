import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import SortableHandle from './SortableHandle';
import LayerToolbar from '../toolbar/LayerToolbar';
import Legend from '../legend/Legend';
import { editLayer, removeLayer, changeLayerOpacity, toggleLayerExpand, toggleLayerVisibility } from '../../../actions/layers';
import { toggleDataTable } from '../../../actions/dataTable';
import './LayerCard.css';


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

const LayerCard = (props) => {
    const {
        layer,
        editLayer,
        removeLayer,
        changeLayerOpacity,
        toggleLayerExpand,
        toggleLayerVisibility,
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
            className='LayerCard'
            containerStyle={styles.container}
            expanded={isExpanded}
            onExpandChange={() => toggleLayerExpand(id)}
        >
            <CardHeader
                className='LayerCard-header'
                title={title}
                subtitle={subtitle}
                showExpandableButton={true}
                textStyle={styles.headerText}
            >
                <SortableHandle color={grey600} />
                <IconButton
                    style={styles.visibility}
                    onClick={() => toggleLayerVisibility(id)}
                    tooltip="Toggle visibility">
                    <SvgIcon
                        icon={isVisible ? 'Visibility' : 'VisibilityOff'}
                        color={grey600}
                    />
                </IconButton>
            </CardHeader>
            <CardText expandable={true} style={styles.body}>
                {legend && <Legend {...legend} />}
                <LayerToolbar
                    layer={layer}
                    onEdit={() => editLayer(layer)}
                    toggleDataTable={toggleDataTable}
                    onOpacityChange={changeLayerOpacity}
                    onRemove={() => removeLayer(id)}
                />
            </CardText>
        </Card>
    )
};

LayerCard.propTypes = {
    layer: PropTypes.object,
    editLayer: PropTypes.func.isRequired,
    removeLayer: PropTypes.func.isRequired,
    changeLayerOpacity: PropTypes.func.isRequired,
    toggleLayerExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
};

export default connect(
    null,
    { editLayer, removeLayer, changeLayerOpacity, toggleLayerExpand, toggleLayerVisibility, toggleDataTable }
)(LayerCard);
