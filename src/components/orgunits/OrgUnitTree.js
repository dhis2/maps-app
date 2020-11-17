import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { OrgUnitTreeMultipleRoots } from '@dhis2/d2-ui-org-unit-tree';
import orgUnitStyles from '@dhis2/d2-ui-org-unit-dialog/styles/OrgUnitSelector.style';
import { loadOrgUnitTree } from '../../actions/orgUnits';
import styles from './styles/OrgUnitTree.module.css';

export class OrgUnitTreeMaps extends Component {
    static propTypes = {
        roots: PropTypes.array,
        selected: PropTypes.array,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
        loadOrgUnitTree: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const { roots, loadOrgUnitTree } = this.props;

        if (!roots) {
            loadOrgUnitTree();
        }
    }

    render() {
        const { roots, selected, disabled } = this.props;

        // TODO: Add loading indicator
        if (!roots) {
            return null;
        }

        return (
            <div className={styles.orgUnitTree}>
                <OrgUnitTreeMultipleRoots
                    roots={roots}
                    selected={selected
                        .filter(item => item.path)
                        .map(item => item.path)}
                    initiallyExpanded={roots.map(root => root.path)}
                    onSelectClick={this.onSelectClick}
                    showFolderIcon
                    disableSpacer
                    {...orgUnitStyles.orgUnitTree}
                />
                {disabled ? (
                    <div className={styles.disabled}>
                        {i18n.t(
                            'It’s not possible to combine user organisation units and select individual units.'
                        )}
                    </div>
                ) : null}
            </div>
        );
    }

    onSelectClick = (evt, orgUnit) => {
        if (!this.props.disabled) {
            this._isClicked = true;
            this.props.onClick(orgUnit);
        }
    };
}

export default connect(
    state => ({
        roots: state.orgUnitTree,
    }),
    { loadOrgUnitTree }
)(OrgUnitTreeMaps);
