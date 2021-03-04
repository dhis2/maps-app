import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import {
    Popover,
    Menu,
    MenuItem,
    Divider,
    IconMore24,
    IconTable16,
    IconVisualizationColumn16,
    IconDownload16,
    IconEdit16,
    IconDelete16,
} from '@dhis2/ui';
import { IconButton } from '../../core';
import styles from './styles/LayerToolbarMore.module.css';

export const LayerToolbarMoreMenu = ({
    layer = {},
    onEdit,
    onRemove,
    toggleDataTable,
    openAs,
    downloadData,
    dataTableOpen,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef();

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
                    <IconMore24 />
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
                                    label={
                                        dataTableOpen
                                            ? i18n.t('Hide data table')
                                            : i18n.t('Show data table')
                                    }
                                    icon={<IconTable16 />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        toggleDataTable();
                                    }}
                                />
                            )}
                            {openAs && (
                                <MenuItem
                                    label={i18n.t('Open as chart')}
                                    icon={<IconVisualizationColumn16 />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        openAs('CHART');
                                    }}
                                />
                            )}
                            {downloadData && (
                                <MenuItem
                                    label={i18n.t('Download data')}
                                    icon={<IconDownload16 />}
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
                                    icon={<IconEdit16 />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        onEdit();
                                    }}
                                />
                            )}
                            {onRemove && (
                                <MenuItem
                                    label={i18n.t('Remove layer')}
                                    icon={<IconDelete16 />}
                                    destructive
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
    dataTableOpen: PropTypes.bool,
};

export default connect(({ dataTable }) => ({
    dataTableOpen: !!dataTable,
}))(LayerToolbarMoreMenu);
