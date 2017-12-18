import React, { Component } from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import OptionStyle from './OptionStyle';
import { loadOptionSet } from '../../actions/optionSets';
import { setStyleOptions } from '../../actions/layerEdit';

// From ColorBrewer
const colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

const style = {
    marginTop: 20,
};

class OptionSetStyle extends Component {

    componentDidMount() {
        if (!this.props.options) {
            this.setOptions();
        }
    }

    componentDidUpdate() {
        if (!this.props.options) {
            this.setOptions();
        }
    }

    setOptions() {
        const { id, optionSets, loadOptionSet, setStyleOptions } = this.props;

        if (!optionSets[id]) {
            loadOptionSet(id);
        } else {
            const byName = {}; // TODO: Use by code when API support it
            optionSets[id].options.forEach((option, index) => byName[option.name] = colors[index] || '#ffffff');
            setStyleOptions(byName);
        }
    }

    render() {
        const { options } = this.props;

        return (
            <div style={style}>
                {options ?
                    Object.keys(options).map(name => <OptionStyle key={name} name={name} color={options[name]} />)
                : <CircularProgress />}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    optionSets: state.optionSets,
});

export default connect(
    (state) => ({
        optionSets: state.optionSets,
    }),
    { loadOptionSet, setStyleOptions }
)(OptionSetStyle);
