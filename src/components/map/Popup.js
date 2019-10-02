import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Popup extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        coordinates: PropTypes.array.isRequired,
        children: PropTypes.node,
    };

    componentDidMount() {
        this.setPopup();
    }

    componentDidUpdate() {
        this.setPopup();
    }

    componentWillUnmount() {
        this.context.map.closePopup();
    }

    render() {
        return (
            <div ref={el => (this.container = el)} style={{ display: 'none' }}>
                {this.props.children}
            </div>
        );
    }

    setPopup = () => {
        const { coordinates } = this.props;
        const container = this.container.cloneNode(true);

        container.style.display = 'block';

        this.context.map.openPopup(container, coordinates);
    };
}

export default Popup;
