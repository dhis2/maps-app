import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Button from '@material-ui/core/Button';
import DimensionRow from './DimensionRow';
import { addDimension } from '../../actions/layerEdit';

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
        /*
        dataItems: PropTypes.array,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        addFilter: PropTypes.func.isRequired,
        removeFilter: PropTypes.func.isRequired,
        changeFilter: PropTypes.func.isRequired,
        */
    };

    render() {
        const { addDimension, classes, dimensions = [] } = this.props;

        // console.log('#', dimensions);

        return (
            <div className={classes.container}>
                {dimensions.map((item, index) => (
                    <DimensionRow
                        key={index}
                        index={index}
                        // dataItems={dataItems}
                        // program={program}
                        // programStage={programStage}
                        // onChange={changeFilter}
                        // onRemove={removeFilter}
                        {...item}
                    />
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addDimension()}
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
    { addDimension }
)(withStyles(styles)(DimensionFilter));
