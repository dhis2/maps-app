import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import DimensionSelect from './DimensionSelect';
import DimensionItemsSelect from './DimensionItemsSelect';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { Tooltip } from '@material-ui/core';

const styles = theme => ({
    container: {
        height: 68,
        marginBottom: 8,
        padding: '-0 56px 0 8px',
        backgroundColor: theme.palette.background.grey,
        position: 'relative',
        clear: 'both',
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
    },
    select: {
        marginRight: 24,
        float: 'left',
        width: 'calc((100% - 48px) / 8 * 3)',
    },
    removeBtnContainer: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        padding: '10px 0px',
        '&:hover': {
            backgroundColor: theme.palette.primary.lightest,
        },
    },
    removeBtn: {
        color: theme.palette.status.negative,
        '&:hover': {
            backgroundColor: 'inherit',
        },
    },
});

class DimensionFilterRow extends Component {
    static propTypes = {
        dimension: PropTypes.string,
        items: PropTypes.array,
        index: PropTypes.number,
        onChange: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { dimension, items, index, onRemove, classes } = this.props;

        console.log(index, dimension, items);

        return (
            <div className={classes.container}>
                <DimensionSelect
                    dimension={dimension}
                    onChange={dimension => this.onChange(dimension.id, items)}
                />
                <DimensionItemsSelect
                    dimension={dimension}
                    onChange={items => this.onChange(dimension, items)}
                />
                <Tooltip title={i18n.t('Delete filter')}>
                    <div
                        className={classes.removeBtnContainer}
                        onClick={() => onRemove(index)}
                    >
                        <IconButton
                            tooltip={i18n.t('Remove filter')}
                            className={classes.removeBtn}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </Tooltip>
            </div>
        );
    }

    onChange(dimension, items) {
        const { index, onChange } = this.props;

        if (dimension !== this.props.dimension) {
            // New dimension
            onChange(index, {
                dimension,
                items: null,
            });
        } else {
            console.log('Dimension items change');
        }
    }
}

export default withStyles(styles)(DimensionFilterRow);
