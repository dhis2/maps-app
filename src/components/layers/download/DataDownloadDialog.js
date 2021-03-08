import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui';
import { EVENT_LAYER } from '../../../constants/layers';

import {
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_NAME,
    META_DATA_FORMAT_CODE,
} from '../../../util/geojson';

import {
    closeDataDownloadDialog,
    startDataDownload,
} from '../../../actions/dataDownload';
import DataDownloadDialogContent from './DataDownloadDialogContent';
import DataDownloadDialogActions from './DataDownloadDialogActions';

const formatOptionsFlat = [
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_CODE,
    META_DATA_FORMAT_NAME,
];
const formatOptions = formatOptionsFlat.map((name, i) => ({
    id: i + 1,
    name,
}));

export class DataDownloadDialog extends Component {
    static propTypes = {
        open: PropTypes.bool.isRequired,
        downloading: PropTypes.bool.isRequired,
        error: PropTypes.string,
        layer: PropTypes.object,
        aggregations: PropTypes.object,
        startDownload: PropTypes.func.isRequired,
        closeDialog: PropTypes.func.isRequired,
    };

    state = {
        selectedFormatOption: 2,
        humanReadableChecked: true,
    };

    onChangeFormatOption = newValue => {
        this.setState({ selectedFormatOption: newValue.id - 1 });
    };
    onCheckHumanReadable = isChecked => {
        this.setState({ humanReadableChecked: isChecked });
    };

    onStartDownload = () => {
        const { layer, aggregations } = this.props;
        const {
            selectedFormatOption,
            humanReadableChecked: humanReadableKeys,
        } = this.state;
        const format = formatOptionsFlat[selectedFormatOption];

        this.props.startDownload({
            layer,
            aggregations,
            format,
            humanReadableKeys,
        });
    };

    render() {
        const { open, layer, downloading, error, closeDialog } = this.props;

        if (!open || !layer) {
            return null;
        }

        const layerType = layer.layer,
            isEventLayer = layerType === EVENT_LAYER;

        return (
            <Modal position="middle" onClose={closeDialog}>
                <ModalTitle>{i18n.t('Download Layer Data')}</ModalTitle>
                <ModalContent>
                    <DataDownloadDialogContent
                        isEventLayer={isEventLayer}
                        error={error}
                        layerName={layer.name}
                        formatOptions={formatOptions}
                        selectedFormatOption={
                            this.state.selectedFormatOption + 1
                        }
                        humanReadableChecked={this.state.humanReadableChecked}
                        onChangeFormatOption={this.onChangeFormatOption}
                        onCheckHumanReadable={this.onCheckHumanReadable}
                    />
                </ModalContent>
                <ModalActions>
                    <DataDownloadDialogActions
                        downloading={downloading}
                        onStartClick={this.onStartDownload}
                        onCancelClick={closeDialog}
                    />
                </ModalActions>
            </Modal>
        );
    }
}

const mapStateToProps = ({ dataDownload, map, aggregations = {} }) => {
    const { layerid, dialogOpen: open, downloading, error } = dataDownload;
    const layer = map.mapViews.find(l => l.id === layerid);

    if (open && !layer) {
        // eslint-disable-next-line
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        );
    }

    return {
        open,
        layer,
        downloading,
        error,
        aggregations: aggregations[layerid],
    };
};

export default connect(mapStateToProps, {
    closeDialog: closeDataDownloadDialog,
    startDownload: startDataDownload,
})(DataDownloadDialog);
