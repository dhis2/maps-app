import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import once from 'lodash/fp/once';
import D2OrgUnitTree from 'd2-ui/lib/org-unit-tree/OrgUnitTree.component';
import { loadOrgUnitTree } from '../../actions/orgUnits';
import { toggleOrganisationUnit } from '../../actions/layerEdit';

const styles = {
    container: {
        position: 'relative',
        marginTop: 12,
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

export class OrgUnitTree extends Component {
    static propTypes = {
        root: PropTypes.object,
        selected: PropTypes.array,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
    };

    constructor(props, context) {
        super(props, context);

        this.selectDefault = once(node => props.onClick(node)); // only select default node once
    }

    componentDidMount() {
        const { root, loadOrgUnitTree } = this.props;

        if (!root) {
            loadOrgUnitTree();
        }
    }

    componentDidUpdate() {
        const { root, selectRootAsDefault } = this.props;

        // Select org.unit root as default
        if (selectRootAsDefault && root) {
            this.selectDefault(root);
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
                <D2OrgUnitTree
                    root={root}
                    selected={selected
                        .filter(item => item.path)
                        .map(item => item.path)} // TODO: Need to select all
                    initiallyExpanded={[root.path]}
                    hideCheckboxes={true}
                    hideMemberCount={true}
                    onSelectClick={(evt, orgUnit) =>
                        !disabled ? onClick(orgUnit) : null
                    }
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
}

export default connect(
    state => ({
        root: state.orgUnitTree,
    }),
    { loadOrgUnitTree, toggleOrganisationUnit }
)(OrgUnitTree);
