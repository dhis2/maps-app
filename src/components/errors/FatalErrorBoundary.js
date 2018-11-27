import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/InfoOutlined';

const styles = {
    mask: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: '#F4F6F8',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        textAlign: 'center',
        color: 'black',
    },
    icon: {
        width: 96,
        height: 96,
        color: '#B0BEC5',
        marginBottom: 24,
    },
    message: {
        fontSize: '24px',
        marginBottom: 24,
    },
    link: {
        fontSize: '18px',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
};

class FatalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true });
    }

    render() {
        const { classes, children } = this.props;
        if (this.state.hasError) {
            return (
                <div className={classes.mask}>
                    <div className={classes.container}>
                        <InfoIcon className={classes.icon} />
                        <div className={classes.message}>
                            {i18n.t('Something went wrong')}
                        </div>
                        <div
                            className={classes.link}
                            onClick={() => window.location.reload()}
                        >
                            {i18n.t('Refresh to try again')}
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

FatalErrorBoundary.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(styles)(FatalErrorBoundary);
