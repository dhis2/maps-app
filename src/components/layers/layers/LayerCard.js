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
import SortableHandle from './SortableHandle';
import LayerToolbar from '../toolbar/LayerToolbar';
import Legend from '../legend/Legend';
import {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
} from '../../../actions/layers';
import { setMessage } from '../../../actions/message';
import { toggleDataTable } from '../../../actions/dataTable';
import { openDataDownloadDialog } from '../../../actions/dataDownload';
import { openAsChart } from '../../../actions/analyticalObject';

const styles = {
    card: {
        position: 'relative',
        margin: '8px 4px 0 4px',
        paddingBottom: 0,
        zIndex: 2000,
    },
    header: {
        height: 54,
        padding: '2px 8px 0 18px',
        fontSize: 14,
    },
    title: {
        width: 227,
        paddingLeft: 15,
        fontSize: 15,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 500,
        lineHeight: '17px',
    },
    subheader: {
        width: 195,
        paddingLeft: 15,
        lineHeight: '17px',
        fontSize: 14,
    },
    legend: {
        paddingLeft: 32,
    },
    actions: {
        backgroundColor: '#eee',
        height: 32,
    },
    visibility: {
        position: 'absolute',
        right: 28,
        top: 4,
    },
    expand: {
        position: 'absolute',
        right: -4,
        top: 4,
    },
    content: {
        fontSize: 14,
        padding: 0, // TODO: Not working on :last-child
    },
};

const downloadableLayerTypes = ['facility', 'thematic', 'boundary', 'event'];
const dataTableLayerTypes = ['facility', 'thematic', 'boundary'];
const openAsChartLayerTypes = ['thematic'];

const LayerCard = ({
    layer,
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    openDataDownloadDialog,
    setMessage,
    classes,
}) => {
    const {
        id,
        name,
        legend,
        isExpanded,
        opacity,
        isVisible,
        layer: layerType,
        isLoaded,
    } = layer;

    const canEdit = layerType !== 'external';
    const canToggleDataTable = dataTableLayerTypes.indexOf(layerType) >= 0;
    const canDownload = downloadableLayerTypes.indexOf(layerType) >= 0;
    const canOpenAsChart = openAsChartLayerTypes.indexOf(layerType) >= 0;

    return (
        <Card className={classes.card} data-test="layercard">
            <CardHeader
                classes={{
                    root: classes.header,
                    title: classes.title,
                    subheader: classes.subheader,
                }}
                title={isLoaded ? name : i18n.t('Loading layer') + '...'}
                subheader={
                    isLoaded && legend && legend.period ? legend.period : null
                }
                action={[
                    <SortableHandle key="handle" />,
                    <Tooltip key="expand" title={i18n.t('Collapse')}>
                        <IconButton
                            className={classes.expand}
                            onClick={() => toggleLayerExpand(id)}
                            tooltip={
                                isExpanded
                                    ? i18n.t('Collapse')
                                    : i18n.t('Expand')
                            }
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isExpanded ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                        </IconButton>
                    </Tooltip>,
                ]}
            />

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent className={classes.content} style={{ padding: 0 }}>
                    {legend && (
                        <div className={classes.legend}>
                            <Legend {...legend} />
                        </div>
                    )}
                    <LayerToolbar
                        opacity={opacity}
                        isVisible={isVisible}
                        onEdit={canEdit ? () => editLayer(layer) : undefined}
                        toggleDataTable={
                            canToggleDataTable
                                ? () => toggleDataTable(id)
                                : undefined
                        }
                        toggleLayerVisibility={() => toggleLayerVisibility(id)}
                        onOpacityChange={newOpacity =>
                            changeLayerOpacity(id, newOpacity)
                        }
                        onRemove={() => {
                            removeLayer(id);
                            setMessage(`${name} ${i18n.t('deleted')}.`);
                        }}
                        downloadData={
                            canDownload
                                ? () => openDataDownloadDialog(id)
                                : undefined
                        }
                        openAsChart={
                            canOpenAsChart ? () => openAsChart(id) : undefined
                        }
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

LayerCard.propTypes = {
    layer: PropTypes.object.isRequired,
    editLayer: PropTypes.func.isRequired,
    removeLayer: PropTypes.func.isRequired,
    changeLayerOpacity: PropTypes.func.isRequired,
    openDataDownloadDialog: PropTypes.func.isRequired,
    setMessage: PropTypes.func.isRequired,
    toggleLayerExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(
    null,
    {
        editLayer,
        removeLayer,
        changeLayerOpacity,
        toggleLayerExpand,
        toggleLayerVisibility,
        toggleDataTable,
        setMessage,
        openDataDownloadDialog,
    }
)(withStyles(styles)(LayerCard));
