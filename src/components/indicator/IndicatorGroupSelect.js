import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadIndicatorGroups } from '../../actions/indicators.js'
import { SelectField } from '../core/index.js'

class IndicatorGroupSelect extends Component {
    static propTypes = {
        loadIndicatorGroups: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
        indicatorGroup: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        indicatorGroups: PropTypes.array,
    }

    componentDidMount() {
        const { indicatorGroups, loadIndicatorGroups } = this.props

        if (!indicatorGroups) {
            loadIndicatorGroups()
        }
    }

    render() {
        const {
            indicatorGroups,
            indicatorGroup,
            onChange,
            className,
            errorText,
        } = this.props

        return (
            <SelectField
                label={i18n.t('Indicator group')}
                loading={indicatorGroups ? false : true}
                items={indicatorGroups}
                value={indicatorGroup ? indicatorGroup.id : null}
                onChange={onChange}
                className={className}
                errorText={!indicatorGroup && errorText ? errorText : null}
                dataTest="indicatorgroupselect"
            />
        )
    }
}

export default connect(
    (state) => ({
        indicatorGroups: state.indicatorGroups,
    }),
    { loadIndicatorGroups }
)(IndicatorGroupSelect)
