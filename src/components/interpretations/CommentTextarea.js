import React from 'react';
import i18next from 'i18next';
import PropTypes from 'prop-types'
import { Link, ActionSeparator } from './misc';

export default class CommentTextarea extends React.Component {
    static propTypes = {
        comment: PropTypes.object.isRequired,
        onPost: PropTypes.func.isRequired,
        onCancel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = { text: props.comment.text || "" };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ text: nextProps.comment.text });
    }

    _onChange(ev) {
        this.setState({ text: ev.target.value });
    }

    _onPost() {
        this.props.onPost(this.state.text);
        this.setState({ text: "" });
    }

    render() {
        const { comment, onCancel } = this.props;
        const { text } = this.state;
        const postText = onCancel ? i18next.t("OK") : i18next.t('Post comment');

        return (
            <div>
                <textarea className="commentArea" value={text} rows={4} onChange={ev => this._onChange(ev)} />
                <Link disabled={!text} label={postText} onClick={() => this._onPost()} />
                {onCancel &&
                    <span>
                        <ActionSeparator />
                        <Link label={i18next.t('Cancel')} onClick={onCancel} />
                    </span>}
            </div>
        );
    }
};
