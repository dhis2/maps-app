import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import OptionStyle from './OptionStyle';
import { loadOptionSet } from '../../actions/optionSets';
import { setOptionStyle } from '../../actions/layerEdit';
import { qualitativeColors } from '../../constants/colors';

const style = {
    marginTop: 20,
};

class OptionSetStyle extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.array,
        optionSet: PropTypes.object,
        loadOptionSet: PropTypes.func.isRequired,
        setOptionStyle: PropTypes.func.isRequired,
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
        const { id, optionSet, loadOptionSet, setOptionStyle } = this.props;

        if (!optionSet) {
            loadOptionSet(id);
        } else {
            setOptionStyle(
                optionSet.options.map((option, index) => ({
                    ...option,
                    style: {
                        color: option.style
                            ? option.style.color
                            : qualitativeColors[index] || '#ffffff',
                    },
                }))
            );
        }
    }

    onChange(id, color) {
        this.props.setOptionStyle(
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
                    <CircularProgress size={48} />
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => ({
        optionSet: state.optionSets[props.id],
    }),
    { loadOptionSet, setOptionStyle }
)(OptionSetStyle);
