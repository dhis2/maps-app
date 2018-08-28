import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { SvgIcon } from '@dhis2/d2-ui-core';
import OpacitySlider from './OpacitySlider';
import DownloadMenu from './DownloadMenu';
import OpenAsMenu from './OpenAsMenu';

const styles = {
    toolbar: {
        backgroundColor: '#eee',
        height: 32,
        padding: '0 8px',
    },
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
    moreButton: {
        float: 'right',
        padding: 4,
        width: 32,
        height: 32,
        marginRight: -7,
        marginLeft: -5,
    },
    menuList: {
        paddingTop: 0,
        paddingBottom: 0,
    },
};

const OverlayToolbar = ({
    layer,
    onEdit,
    onRemove,
    toggleDataTable,
    onOpacityChange,
}) => (
    <Toolbar style={styles.toolbar}>
        <ToolbarGroup>
            {onEdit &&
                layer.type !== 'external' && (
                    <IconButton
                        onClick={() => onEdit(layer)}
                        tooltip={i18n.t('Edit')}
                        tooltipPosition="top-center"
                        style={styles.button}
                    >
                        <SvgIcon icon="Create" />
                    </IconButton>
                )}
            {(layer.layer === 'thematic' ||
                layer.layer === 'boundary' ||
                layer.layer === 'facility') && (
                <IconButton
                    onClick={() => toggleDataTable(layer.id)}
                    tooltip={i18n.t('Data table')}
                    tooltipPosition="top-center"
                    style={styles.button}
                >
                    <SvgIcon icon="ViewList" />
                </IconButton>
            )}

            <OpacitySlider
                {...layer}
                onChange={opacity => onOpacityChange(layer.id, opacity)}
            />
        </ToolbarGroup>

        <ToolbarGroup>
            {onRemove && (
                <IconButton
                    onClick={onRemove}
                    tooltip={i18n.t('Delete')}
                    tooltipPosition="top-center"
                    style={styles.button}
                >
                    <SvgIcon icon="Delete" />
                </IconButton>
            )}

            {true === false && ( //    TODO
                <IconMenu
                    iconButtonElement={
                        <IconButton
                            tooltip={i18n.t('More')}
                            tooltipPosition="top-center"
                            style={styles.moreButton}
                        >
                            <SvgIcon icon="MoreVert" />
                        </IconButton>
                    }
                    listStyle={styles.menuList}
                >
                    <OpenAsMenu {...layer} />
                    <DownloadMenu {...layer} />
                </IconMenu>
            )}
        </ToolbarGroup>
    </Toolbar>
);

OverlayToolbar.propTypes = {
    layer: PropTypes.object,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    onOpacityChange: PropTypes.func,
    toggleDataTable: PropTypes.func,
};

export default OverlayToolbar;
