import React from 'react';
import { Link, ActionSeparator, WithAvatar, getUserLink } from './misc';
import CommentTextarea from './CommentTextarea';
import { userCanManage } from '../../util/auth';
import { FormattedRelative } from 'react-intl';
import PropTypes from 'prop-types';
import i18next from 'i18next';

const Comment = ({ comment, showActions, onEdit, onDelete }) => (
    <div>
        <div className="commentText">
            {comment.text}
        </div>

        <span className="tipText">
            <FormattedRelative value={comment.created} />
        </span>

        <ActionSeparator labelText="" />

        {showActions &&
            <span>
                <Link label={i18next.t('Edit')} onClick={() => onEdit(comment)} />
                <ActionSeparator />
                <Link label={i18next.t('Delete')} onClick={() => onDelete(comment)} />
            </span>}
    </div>
);

export default class InterpretationComments extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        comments: PropTypes.arrayOf(PropTypes.object).isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
    };

    state = {
        commentToEdit: null,
    };

    _onEdit(comment) {
        this.setState({ commentToEdit: comment });
    }

    _onCancelEdit(comment) {
        this.setState({ commentToEdit: null });
    }

    _onDelete(comment) {
        if (confirm(i18next.t('Are you sure you want to remove this comment?'))) {
            this.props.onDelete(comment);
        }
    }

    _onSave(comment) {
        this.setState({ commentToEdit: null });
        this.props.onSave(comment);
    }

    render() {
        const { d2, comments } = this.props;
        const { commentToEdit } = this.state;

        return (
            <div>
                <WithAvatar user={d2.currentUser}>
                    <CommentTextarea comment={{text: ""}} onPost={text => this._onSave({text})} />
                </WithAvatar>

                {comments.map(comment =>
                    <WithAvatar key={comment.id} user={comment.user}>
                        <div className="commentAuthor">
                            {getUserLink(d2, comment.user)}
                        </div>

                        {commentToEdit && commentToEdit.id === comment.id
                            ?
                                <CommentTextarea
                                    comment={comment}
                                    onPost={text => this._onSave({...comment, text})}
                                    onCancel={() => this._onCancelEdit()}
                                />
                            :
                                <Comment
                                    comment={comment}
                                    showActions={userCanManage(d2, comment)}
                                    onEdit={() => this._onEdit(comment)}
                                    onDelete={() => this._onDelete(comment)}
                                />
                        }
                    </WithAvatar>
                )}
            </div>
        );
    }
};
