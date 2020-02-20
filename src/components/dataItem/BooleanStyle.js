import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import OptionStyle from '../optionSet/OptionStyle';
import { setBooleanStyle } from '../../actions/layerEdit';
import { qualitativeColors } from '../../constants/colors';

const style = {
    marginTop: 20,
};

export class BooleanStyle extends Component {
    static propTypes = {
        valueType: PropTypes.string.isRequired,
        values: PropTypes.shape({
            true: PropTypes.string.isRequired,
            false: PropTypes.string,
        }),
        setBooleanStyle: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const { valueType, values, setBooleanStyle } = this.props;

        if (!values) {
            setBooleanStyle('true', qualitativeColors[0]);

            if (valueType === 'BOOLEAN') {
                setBooleanStyle('false', qualitativeColors[1]);
            }
        }
    }

    render() {
        const { valueType, values, setBooleanStyle } = this.props;

        if (!values) {
            return null;
        }

        return (
            <div style={style}>
                <OptionStyle
                    name={i18n.t('Yes')}
                    color={values.true}
                    onChange={color => setBooleanStyle('true', color)}
                />
                {valueType === 'BOOLEAN' ? (
                    <OptionStyle
                        name={'No'}
                        color={values.false}
                        onChange={color => setBooleanStyle('false', color)}
                    />
                ) : null}
            </div>
        );
    }
}

export default connect(null, { setBooleanStyle })(BooleanStyle);
