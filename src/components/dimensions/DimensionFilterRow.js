import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DimensionSelect from './DimensionSelect';
import DimensionItemsSelect from './DimensionItemsSelect';
import RemoveFilter from '../filter/RemoveFilter';

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

    onChange(dimension, items) {
        const { index, onChange } = this.props;

        onChange(index, { dimension, items });
    }

    render() {
        const { dimension, items, index, onRemove, classes } = this.props;

        return (
            <div className={classes.container}>
                <DimensionSelect
                    dimension={dimension}
                    onChange={dimension => this.onChange(dimension.id)}
                />
                <DimensionItemsSelect
                    dimension={dimension}
                    value={items ? items.map(item => item.id) : null}
                    onChange={items => this.onChange(dimension, items)}
                />
                <RemoveFilter onClick={() => onRemove(index)} />
            </div>
        );
    }
}

export default withStyles(styles)(DimensionFilterRow);
