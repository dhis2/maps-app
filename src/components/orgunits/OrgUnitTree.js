import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import { OrgUnitTreeMultipleRoots } from '@dhis2/d2-ui-org-unit-tree';
import orgUnitStyles from '@dhis2/d2-ui-org-unit-dialog/styles/OrgUnitSelector.style';
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
        classes: PropTypes.object.isRequired,
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
        const { classes, roots, selected, disabled } = this.props;

        // TODO: Add loading indicator
        if (!roots) {
            return null;
        }

        return (
            <div className={classes.container}>
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
                    <div className={classes.disabled}>
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
)(withStyles(styles)(OrgUnitTreeMaps));
