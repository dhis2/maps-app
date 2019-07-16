import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import './ContextMenu.css';

class ContextMenu extends Component {
    componentDidUpdate() {
        const { position } = this.props;

        if (position) {
            this.el.style.left = position[0] + 'px';
            this.el.style.top = position[1] + 'px';
        }
    }

    render() {
        const { position, feature, onDrill } = this.props;

        if (!position || !feature) {
            return null;
        }

        const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties;

        return (
            <div className="MapContextMenu" ref={el => (this.el = el)}>
                {hasCoordinatesUp && (
                    <div onClick={() => onDrill('up')}>
                        {i18n.t('Drill up one level')}
                    </div>
                )}
                {hasCoordinatesDown && (
                    <div onClick={() => onDrill('down')}>
                        {i18n.t('Drill down one level')}
                    </div>
                )}
            </div>
        );
    }
}

ContextMenu.propTypes = {
    feature: PropTypes.object,
    position: PropTypes.array,
    onDrill: PropTypes.func.isRequired,
};

export default ContextMenu;
