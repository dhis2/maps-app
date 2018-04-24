import React from 'react';
import { Avatar } from 'material-ui';

export const getUserLink = (d2, user) => {
    const baseurl = d2.system.systemInfo.contextPath;
    const userUrl =`${baseurl}/dhis-web-messaging/profile.action?id=${user.id}`;
    return (<a href={userUrl} className="bold userLink" target="_blank">{user.displayName}</a>);
};

export const Link = (props) => {
    const { label, ...otherProps } = props;
    return <a className="interpretation" {...otherProps}>{label}</a>;
};

export const ActionSeparator = ({labelText = "·"}) => (
    <label className="linkArea">{labelText}</label>
);

const UserAvatar = ({user}) => {
    const initials = user.displayName.split(" ").map(part => part[0]).slice(0, 2).join("");
    const style = {fontSize: 15, fontWeight: 'bold'};
    return <Avatar color="black" size={32} style={style}>{initials}</Avatar>;
};

export const WithAvatar = ({ user, children }) => (
    <div className="greyBackground" style={{display: "flex", marginTop: 10, marginBottom: 10}}>
        <div style={{width: 40, marginLeft: 5}}>
            <UserAvatar user={user} />
        </div>

        <div style={{width: '90%'}}>
            {children}
        </div>
    </div>
);
