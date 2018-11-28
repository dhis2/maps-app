import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/InfoOutlined';

const bgColor = '#F4F6F8',
    secondaryTextColor = '#494949';
const styles = {
    mask: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: bgColor,

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
        height: 100,
        maxWidth: 500,
        overflowY: 'auto',
        fontSize: '12px',
        color: 'red',
        border: `1px solid ${secondaryTextColor}`,
        textAlign: 'left',
    },
    drawerHidden: {
        display: 'none',
    },
};

class FatalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            techInfoDrawerOpen: false,
            techInfoText: '',
        };
    }

    componentDidCatch(error, info) {
        this.setState({
            hasError: true,
            techInfoDrawerOpen: false,
            techInfoText: `${error.stack}\n---${info.componentStack}`,
        });
    }

    toggleTechInfoDrawer = () => {
        this.setState({
            techInfoDrawerOpen: !this.state.techInfoDrawerOpen,
        });
    };

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
                        <div
                            className={classes.drawerToggle}
                            onClick={this.toggleTechInfoDrawer}
                        >
                            {this.state.techInfoDrawerOpen
                                ? i18n.t('Hide technical details')
                                : i18n.t('Show technical details')}
                        </div>
                        <div
                            className={
                                this.state.techInfoDrawerOpen
                                    ? classes.drawerVisible
                                    : classes.drawerHidden
                            }
                        >
                            {this.state.techInfoText
                                .split('\n')
                                .reduce(
                                    (out, line, i) => [
                                        ...out,
                                        line,
                                        <br key={i} />,
                                    ],
                                    []
                                )}
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
