import i18n from '@dhis2/d2-i18n'
import { Layer, CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './styles/FatalErrorBoundary.module.css'

const translatedErrorHeading = i18n.t(
    'An error occurred in the DHIS2 Maps application.'
)

const replaceNewlinesWithBreaks = (text) =>
    text
        .split('\n')
        .reduce((out, line, i) => [...out, line, <br key={i} />], [])

class FatalErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null,
            drawerOpen: false,
        }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        })
    }

    toggleTechInfoDrawer = () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        })
    }

    render() {
        const { children } = this.props
        if (this.state.error) {
            return (
                <Layer level={2000} position="fixed">
                    <CenteredContent position="middle">
                        <div className={styles.notice}>
                            <NoticeBox
                                error
                                title={i18n.t('Something went wrong')}
                            >
                                <div
                                    className={styles.link}
                                    onClick={() => window.location.reload()}
                                >
                                    {i18n.t('Refresh to try again')}
                                </div>
                                <div
                                    className={styles.drawerToggle}
                                    onClick={this.toggleTechInfoDrawer}
                                >
                                    {this.state.drawerOpen
                                        ? i18n.t('Hide technical details')
                                        : i18n.t('Show technical details')}
                                </div>
                                <div
                                    className={
                                        this.state.drawerOpen
                                            ? styles.drawerVisible
                                            : styles.drawerHidden
                                    }
                                >
                                    <div className={styles.errorIntro}>
                                        {translatedErrorHeading}
                                        <br />
                                        {i18n.t(
                                            'The following information may be requested by technical support.'
                                        )}
                                    </div>
                                    <div className={styles.errorDetails}>
                                        {[
                                            replaceNewlinesWithBreaks(
                                                this.state.error.stack +
                                                    '\n---' +
                                                    this.state.errorInfo
                                                        .componentStack
                                            ),
                                        ]}
                                    </div>
                                </div>
                            </NoticeBox>
                        </div>
                    </CenteredContent>
                </Layer>
            )
        }

        return children
    }
}

FatalErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}

export default FatalErrorBoundary
