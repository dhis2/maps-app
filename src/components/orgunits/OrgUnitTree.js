import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { OrgUnitTree } from '@dhis2/d2-ui-org-unit-tree';
import { loadOrgUnitTree } from '../../actions/orgUnits';

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        height: 310,
        padding: 8,
        overflow: 'auto',
        boxSizing: 'border-box',
        border: '1px solid #ddd',
    },
    label: {
        cursor: 'pointer',
    },
    selectedLabel: {
        cursor: 'pointer',
    },
    disabled: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: 'rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 40,
        lineHeight: '30px',
        fontStyle: 'italic',
    },
};

export class OrgUnitTreeMaps extends Component {
    static propTypes = {
        root: PropTypes.object,
        selected: PropTypes.array,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
    };

    componentDidMount() {
        const { root, loadOrgUnitTree } = this.props;

        if (!root) {
            loadOrgUnitTree();
        }
    }

    componentDidUpdate() {
        const { root, selectRootAsDefault, onClick } = this.props;

        // Select org.unit root as default
        if (!this._isClicked && selectRootAsDefault && root) {
            onClick(root);
        }
    }

    render() {
        const { root, selected, disabled, onClick } = this.props;

        if (!root) {
            // TODO: Add loading indicator
            return null;
        }

        return (
            <div style={styles.container}>
                <OrgUnitTree
                    root={root}
                    selected={selected
                        .filter(item => item.path)
                        .map(item => item.path)} // TODO: Need to select all
                    initiallyExpanded={[root.path]}
                    hideCheckboxes={true}
                    hideMemberCount={true}
                    onSelectClick={this.onSelectClick}
                    labelStyle={styles.label}
                    selectedLabelStyle={styles.selectedLabel}
                />
                {disabled ? (
                    <div style={styles.disabled}>
                        It’s not possible to combine user organisation units and
                        select individual units.
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
        root: state.orgUnitTree,
    }),
    { loadOrgUnitTree }
)(OrgUnitTreeMaps);
