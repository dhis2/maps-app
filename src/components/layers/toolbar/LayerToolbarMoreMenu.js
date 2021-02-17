import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Popover, Menu, MenuItem, Divider } from '@dhis2/ui';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import EditIcon from '@material-ui/icons/Create';
import TableIcon from '@material-ui/icons/ViewList';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/SaveAlt';
import ChartIcon from '@material-ui/icons/BarChart';
import ImportIcon from '@material-ui/icons/Input';
import ImportDialog from '../import/ImportDialog';
import IconButton from '../../core/IconButton';
import { IMPORTABLE_LAYER_TYPES } from '../../../constants/layers';
import styles from './styles/LayerToolbarMore.module.css';

export const LayerToolbarMoreMenu = ({
    layer = {},
    onEdit,
    onRemove,
    toggleDataTable,
    openAs,
    downloadData,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const anchorRef = useRef();

    const { layer: layerType } = layer;
    const canImport = IMPORTABLE_LAYER_TYPES.includes(layerType);

    const somethingAboveDivider = toggleDataTable || downloadData,
        somethingBelowDivider = onRemove || onEdit,
        showDivider = somethingAboveDivider && somethingBelowDivider;

    if (!somethingAboveDivider && !somethingBelowDivider) {
        return null;
    }

    return (
        <Fragment>
            <div
                ref={anchorRef}
                className={styles.moreMenuButton}
                onClick={() => setIsOpen(!isOpen)}
                data-test="moremenubutton"
            >
                <IconButton
                    tooltip={i18n.t('More actions')}
                    onClick={() => setIsOpen(!isOpen)}
                    dataTest="moremenubutton"
                >
                    <MoreIcon />
                </IconButton>
            </div>

            {isOpen && layer && (
                <Popover
                    reference={anchorRef}
                    arrow={false}
                    placement="right-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.menu}>
                        <Menu dense>
                            {toggleDataTable && (
                                <MenuItem
                                    label={i18n.t('Show data table')}
                                    icon={<TableIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        toggleDataTable();
                                    }}
                                />
                            )}
                            {openAs && (
                                <MenuItem
                                    label={i18n.t('Open as chart')}
                                    icon={<ChartIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        openAs('CHART');
                                    }}
                                />
                            )}
                            {canImport && (
                                <MenuItem
                                    label={i18n.t('Import data')}
                                    icon={<ImportIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setShowImportDialog(true);
                                    }}
                                />
                            )}
                            {downloadData && (
                                <MenuItem
                                    label={i18n.t('Download data')}
                                    icon={<SaveIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        downloadData();
                                    }}
                                />
                            )}
                            {showDivider && <Divider />}
                            {onEdit && (
                                <MenuItem
                                    label={i18n.t('Edit layer')}
                                    icon={<EditIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        onEdit();
                                    }}
                                />
                            )}
                            {onRemove && (
                                <MenuItem
                                    label={i18n.t('Remove layer')}
                                    icon={<DeleteIcon />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        onRemove();
                                    }}
                                />
                            )}
                        </Menu>
                    </div>
                </Popover>
            )}
            {showImportDialog && (
                <ImportDialog
                    layer={layer}
                    onClose={() => setShowImportDialog(false)}
                />
            )}
        </Fragment>
    );
};

LayerToolbarMoreMenu.propTypes = {
    layer: PropTypes.object,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    toggleDataTable: PropTypes.func,
    openAs: PropTypes.func,
    downloadData: PropTypes.func,
};

export default LayerToolbarMoreMenu;
