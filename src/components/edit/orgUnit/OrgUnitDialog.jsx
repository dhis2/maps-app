import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    setRadiusLow,
    setOrganisationUnitColor,
    setCountFeaturesWithoutCoordinates,
} from '../../../actions/layerEdit.js'
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    STYLE_TYPE_COLOR,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import {
    Tab,
    Tabs,
    NumberField,
    ColorPicker,
    Checkbox,
} from '../../core/index.js'
import StyleByGroupSet from '../../groupSet/StyleByGroupSet.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import Labels from '../shared/Labels.jsx'
import styles from '../styles/LayerDialog.module.css'

class OrgUnitDialog extends Component {
    static propTypes = {
        setCountFeaturesWithoutCoordinates: PropTypes.func.isRequired,
        setOrganisationUnitColor: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        countFeaturesWithoutCoordinates: PropTypes.bool,
        organisationUnitColor: PropTypes.string,
        radiusLow: PropTypes.number,
        rows: PropTypes.array,
    }

    state = {
        tab: 'orgunits',
    }

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate())
        }
    }

    render() {
        const {
            radiusLow,
            organisationUnitColor,
            countFeaturesWithoutCoordinates,
            setOrganisationUnitColor,
            setRadiusLow,
            setCountFeaturesWithoutCoordinates,
        } = this.props

        const { tab, orgUnitsError } = this.state

        return (
            <div className={styles.content} data-test="orgunitdialog">
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
                    {tab === 'orgunits' && (
                        <OrgUnitSelect warning={orgUnitsError} />
                    )}
                    {tab === 'style' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="orgunitdialog-styletab"
                        >
                            <div className={styles.flexColumn}>
                                <Labels className={styles.noMarginTop} />
                                <ColorPicker
                                    label={i18n.t('Boundary color')}
                                    color={
                                        organisationUnitColor || ORG_UNIT_COLOR
                                    }
                                    onChange={setOrganisationUnitColor}
                                    className={cx(
                                        styles.narrowField,
                                        styles.marginTop
                                    )}
                                />
                                <NumberField
                                    label={i18n.t('Point radius')}
                                    min={MIN_RADIUS}
                                    max={MAX_RADIUS}
                                    value={
                                        radiusLow !== undefined
                                            ? radiusLow
                                            : ORG_UNIT_RADIUS
                                    }
                                    onChange={setRadiusLow}
                                    className={styles.narrowFieldIcon}
                                />
                                <Checkbox
                                    label={i18n.t(
                                        'Count org units without coordinates'
                                    )}
                                    checked={!!countFeaturesWithoutCoordinates}
                                    onChange={
                                        setCountFeaturesWithoutCoordinates
                                    }
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <StyleByGroupSet
                                    defaultStyleType={STYLE_TYPE_COLOR}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        })

        return false
    }

    validate() {
        const { rows } = this.props

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected'),
                'orgunits'
            )
        }

        return true
    }
}

export default connect(
    (state) => ({
        countFeaturesWithoutCoordinates:
            state.layerEdit.countFeaturesWithoutCoordinates,
    }),
    {
        setRadiusLow,
        setOrganisationUnitColor,
        setCountFeaturesWithoutCoordinates,
    },
    null,
    {
        forwardRef: true,
    }
)(OrgUnitDialog)
