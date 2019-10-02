import { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

class Popup extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        coordinates: PropTypes.array.isRequired,
        onClose: PropTypes.func.isRequired,
        children: PropTypes.node,
    };

    constructor() {
        super();
        this.container = document.createElement('div');
    }

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
        return createPortal(this.props.children, this.container);
    }

    setPopup = () => {
        const { coordinates, onClose } = this.props;
        this.context.map.openPopup(this.container, coordinates, onClose);
    };
}

export default Popup;
