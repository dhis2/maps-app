import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.array,
        optionSet: PropTypes.object,
        loadOptionSet: PropTypes.func.isRequired,
        setStyleOptions: PropTypes.func.isRequired,
    };

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
            setStyleOptions(
                optionSet.options.map((option, index) => ({
                    ...option,
                    style: {
                        color: option.style
                            ? option.style.color
                            : colors[index] || '#ffffff',
                    },
                }))
            );
        }
    }

    onChange(id, color) {
        this.props.setStyleOptions(
            this.props.options.map(option => {
                if (option.id === id) {
                    return {
                        ...option,
                        style: {
                            color,
                        },
                    };
                }
                return option;
            })
        );
    }

    render() {
        const { options } = this.props;

        return (
            <div style={style}>
                {options ? (
                    options.map(({ id, name, style }) => (
                        <OptionStyle
                            key={id}
                            name={name}
                            color={style.color}
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
