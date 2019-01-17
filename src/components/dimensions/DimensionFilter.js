import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Button from '@material-ui/core/Button';
import DimensionFilterRow from './DimensionFilterRow';
import {
    addDimensionFilter,
    removeDimensionFilter,
    changeDimensionFilter,
} from '../../actions/layerEdit';

const styles = () => ({
    container: {
        width: '100%',
        height: 300,
        paddingTop: 8,
        overflowY: 'auto',
    },
    button: {
        marginTop: 8,
    },
    note: {
        paddingTop: 16,
    },
});

class DimensionFilter extends Component {
    static propTypes = {
        dimensions: PropTypes.array,
        addDimensionFilter: PropTypes.func.isRequired,
        removeDimensionFilter: PropTypes.func.isRequired,
        changeDimensionFilter: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    render() {
        const {
            addDimensionFilter,
            classes,
            dimensions = [],
            changeDimensionFilter,
            removeDimensionFilter,
        } = this.props;

        // console.log('#', dimensions);

        return (
            <div className={classes.container}>
                {dimensions.map((item, index) => (
                    <DimensionFilterRow
                        key={index}
                        index={index}
                        onChange={changeDimensionFilter}
                        onRemove={removeDimensionFilter}
                        {...item}
                    />
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addDimensionFilter()}
                    className={classes.button}
                >
                    {i18n.t('Add filter')}
                </Button>
            </div>
        );
    }
}

export default connect(
    null,
    { addDimensionFilter, removeDimensionFilter, changeDimensionFilter }
)(withStyles(styles)(DimensionFilter));
