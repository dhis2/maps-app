import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui';

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
        this.props.startDownload(
            this.props.layer,
            formatOptionsFlat[this.state.selectedFormatOption],
            this.state.humanReadableChecked
        );
    };

    render() {
        const {
            open,
            layer,
            downloading,
            error,

            closeDialog,
        } = this.props;

        if (!open || !layer) {
            return null;
        }

        const layerType = layer.layer,
            isEventLayer = layerType === 'event';

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

const mapStateToProps = state => {
    const id = state.dataDownload.layerid;
    const layer =
        id !== null ? state.map.mapViews.filter(l => l.id === id)[0] : null;

    if (state.dataDownload.dialogOpen && !layer) {
        // eslint-disable-next-line
        console.error(
            'Tried to open data download dialog without specifying a source layer!'
        );
    }
    return {
        open: state.dataDownload.dialogOpen,
        layer: layer,
        downloading: state.dataDownload.downloading,
        error: state.dataDownload.error,
    };
};

export default connect(mapStateToProps, {
    closeDialog: closeDataDownloadDialog,
    startDownload: startDataDownload,
})(DataDownloadDialog);
