import i18n from '@dhis2/d2-i18n'
import { CenteredContent } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null,
        }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        })
    }

    render() {
        const { children } = this.props
        if (this.state.error) {
            return (
                <CenteredContent>
                    <p>{i18n.t('Something went wrong')}</p>
                </CenteredContent>
            )
        }

        return children
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}

export default ErrorBoundary
