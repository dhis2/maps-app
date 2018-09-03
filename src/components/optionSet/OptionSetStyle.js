import React, { Component } from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import OptionStyle from './OptionStyle';
import { loadOptionSet } from '../../actions/optionSets';
import { setStyleOptions } from '../../actions/layerEdit';

// From ColorBrewer
const colors = [
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99',
    '#b15928',
];

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
        const { id, optionSet, loadOptionSet, setStyleOptions } = this.props;

        if (!optionSet) {
            loadOptionSet(id);
        } else {

            const byId = optionSet.options.reduce((obj, { id }, index) => {
                obj[id] = colors[index] || '#ffffff';
                return obj
            }, {});

            /*
            const byName = {}; // TODO: Use by code when API support it
            optionSets[id].options.forEach(
                (option, index) =>
                    (byName[option.name] = colors[index] || '#ffffff')
            );
            */

            // console.log('setStyleOptions', byId, optionSets[id].options);
            setStyleOptions(byId);
        }
    }

    onChange(id, color) {
        const options = { ...this.props.options };
        options[id] = color;

        console.log('setStyleOptions', options);

        this.props.setStyleOptions(options);
    }

    render() {
        const { options, optionSet } = this.props;
        
        // if (!)

        console.log('render', options, optionSet);

        return (
            <div style={style}>
                {optionSet && options ? (
                    optionSet.options.map(({ id, name }) => (
                        <OptionStyle
                            key={id}
                            name={name}
                            color={options[id]}
                            onChange={color => this.onChange(id, color)}
                        />
                    ))
                ) : (
                    <CircularProgress />
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => ({
        optionSet: state.optionSets[props.id],
    }),
    { loadOptionSet, setStyleOptions }
)(OptionSetStyle);
