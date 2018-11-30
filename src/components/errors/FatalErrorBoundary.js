import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/InfoOutlined';

const bgColor = '#F4F6F8',
    secondaryTextColor = '#494949';

const replaceNewlinesWithBreaks = text =>
    text
        .split('\n')
        .reduce((out, line, i) => [...out, line, <br key={i} />], []);

const styles = {
    mask: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        overflow: 'auto',
        overflowY: 'auto',

        backgroundColor: bgColor,

        display: 'flex',

        minWidth: 640,
        minHeight: 480,

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
        marginBottom: 24,
    },
    drawerToggle: {
        fontSize: '12px',
        color: secondaryTextColor,
        textDecoration: 'underline',
        cursor: 'pointer',
        marginBottom: 12,
    },
    drawerVisible: {
        padding: 8,
        display: 'block',
        height: 150,
        width: 500,
        overflow: 'auto',
        overflowY: 'auto',
        border: `1px solid ${secondaryTextColor}`,
        textAlign: 'left',
    },
    drawerHidden: {
        display: 'none',
    },
    errorIntro: {
        fontSize: '12px',
        lineHeight: 1.2,
        color: secondaryTextColor,
        marginBottom: 8,
        fontFamily: 'Menlo, Courier, monospace !important',
    },
    errorDetails: {
        fontSize: '12px',
        lineHeight: 1.2,
        color: 'red',
        fontFamily: 'Menlo, Courier, monospace !important',
    },
};

class FatalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null,
            drawerOpen: false,
        };
    }

    componentDidCatch(error, info) {
        this.setState({
            error,
            errorInfo: info,
        });
    }

    toggleTechInfoDrawer = () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        });
    };

    render() {
        const { classes, children } = this.props;
        if (this.state.error) {
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
                        <div
                            className={classes.drawerToggle}
                            onClick={this.toggleTechInfoDrawer}
                        >
                            {this.state.drawerOpen
                                ? i18n.t('Hide technical details')
                                : i18n.t('Show technical details')}
                        </div>
                        <div
                            className={
                                this.state.drawerOpen
                                    ? classes.drawerVisible
                                    : classes.drawerHidden
                            }
                        >
                            <div className={classes.errorIntro}>
                                {i18n.t(
                                    'An error occurred in the DHIS2 {{AppName}} application.',
                                    { AppName: 'Maps' }
                                )}
                                <br />
                                {i18n.t(
                                    'The following information may be requested by technical support.'
                                )}
                            </div>
                            <div className={classes.errorDetails}>
                                {[
                                    replaceNewlinesWithBreaks(
                                        this.state.error.stack +
                                            '\n---' +
                                            this.state.errorInfo.componentStack
                                    ),
                                ]}
                            </div>
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
