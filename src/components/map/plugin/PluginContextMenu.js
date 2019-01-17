import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import './PluginContextMenu.css';

class ContextMenu extends Component {
    componentDidUpdate() {
        const { position } = this.props;

        if (position) {
            this.el.style.left = position[0] + 'px';
            this.el.style.top = position[1] + 'px';
        }
    }

    render() {
        const { position, feature, onDrillDown, onDrillUp } = this.props;

        if (!position || !feature) {
            return null;
        }

        const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties;

        return (
            <div className="MapContextMenu" ref={el => (this.el = el)}>
                {hasCoordinatesUp && (
                    <div onClick={onDrillUp}>
                        {i18n.t('Drill up one level')}
                    </div>
                )}
                {hasCoordinatesDown && (
                    <div onClick={onDrillDown}>
                        {i18n.t('Drill down one level')}
                    </div>
                )}
            </div>
        );
    }
}

ContextMenu.propTypes = {
    feature: PropTypes.object,
    position: PropTypes.string,
    onDrillDown: PropTypes.func.isRequired,
    onDrillUp: PropTypes.func.isRequired,
};

export default ContextMenu;
