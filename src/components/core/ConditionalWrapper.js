import PropTypes from 'prop-types';

const ConditionalWrapper = ({ condition, wrapper, children }) =>
    condition ? wrapper(children) : children;

ConditionalWrapper.propTypes = {
    condition: PropTypes.bool.isRequired,
    wrapper: PropTypes.elementType.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

export default ConditionalWrapper;
