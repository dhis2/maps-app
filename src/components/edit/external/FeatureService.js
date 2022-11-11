import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { request } from '@esri/arcgis-rest-request';
import { Tab, Tabs } from '../../core';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import { toggleOrgUnit } from '../../../actions/layerEdit';
import { getOrgUnitNodesFromRows } from '../../../util/analytics';
import styles from '../styles/LayerDialog.module.css';

const FeatureServiceDialog = ({
    rows = [],
    config,
    toggleOrgUnit,
    validateLayer,
    onLayerValidation,
}) => {
    const [tab, setTab] = useState('orgunits');
    const [metadata, setMetadata] = useState();

    const { url } = config;

    useEffect(() => {
        request(url).then(setMetadata);
    }, [url]);

    useEffect(() => {
        if (metadata) {
            // console.log('metadata', metadata);
        }
    }, [metadata]);

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(true); // TODO
        }
    }, [validateLayer, onLayerValidation]);

    return (
        <div className={styles.content} data-test="orgunitdialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'orgunits' && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="orgunitdialog-orgunitstab"
                    >
                        <div className={styles.orgUnitTree}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrgUnit}
                                // disabled={hasUserOrgUnits}
                            />
                        </div>
                    </div>
                )}
                {tab === 'style' && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="orgunitdialog-styletab"
                    >
                        <div className={styles.flexColumn}></div>
                        <div className={styles.flexColumn}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

FeatureServiceDialog.propTypes = {
    rows: PropTypes.array,
    toggleOrgUnit: PropTypes.func.isRequired,
    config: PropTypes.shape({
        url: PropTypes.string.isRequired,
    }),
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
};

export default connect(
    null,
    {
        toggleOrgUnit,
    },
    null,
    {
        forwardRef: true,
    }
)(FeatureServiceDialog);