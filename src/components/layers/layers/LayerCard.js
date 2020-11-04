import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
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
import SortableHandle from './SortableHandle';
import LayerToolbar from '../toolbar/LayerToolbar';
import Legend from '../../legend/Legend';
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
import { setAnalyticalObjectAndSwitchApp } from '../../../util/analyticalObject';
import styles from './styles/LayerCard.module.css';

const downloadableLayerTypes = ['facility', 'thematic', 'boundary', 'event'];
const dataTableLayerTypes = ['facility', 'thematic', 'boundary', 'event'];
const openAsLayerTypes = ['thematic'];

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
    const canToggleDataTable = dataTableLayerTypes.includes(layerType);
    const canDownload = downloadableLayerTypes.includes(layerType);
    const canOpenAs = openAsLayerTypes.includes(layerType);

    return (
        <Card className={styles.card} data-test="layercard">
            <CardHeader
                classes={{
                    root: styles.header,
                    title: styles.title,
                    subheader: styles.subheader,
                }}
                title={isLoaded ? name : i18n.t('Loading layer') + '...'}
                subheader={
                    isLoaded && legend && legend.period ? legend.period : null
                }
                action={[
                    <SortableHandle key="handle" />,
                    <Tooltip
                        key="expand"
                        title={
                            isExpanded ? i18n.t('Collapse') : i18n.t('Expand')
                        }
                        classes={{
                            tooltipPlacementBottom: styles.tooltip,
                        }}
                    >
                        <IconButton
                            className={styles.expand}
                            onClick={() => toggleLayerExpand(id)}
                            style={{ backgroundColor: 'transparent' }}
                        >
                            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                    </Tooltip>,
                ]}
            />

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent className={styles.content} style={{ padding: 0 }}>
                    {legend && (
                        <div className={styles.legend}>
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
                            setMessage(i18n.t('{{name}} deleted.', { name }));
                        }}
                        downloadData={
                            canDownload
                                ? () => openDataDownloadDialog(id)
                                : undefined
                        }
                        openAs={
                            canOpenAs
                                ? type =>
                                      setAnalyticalObjectAndSwitchApp(
                                          layer,
                                          type
                                      )
                                : undefined
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
};

export default connect(null, {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    setMessage,
    openDataDownloadDialog,
})(LayerCard);
