import React from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { useSelector } from 'react-redux'
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip'
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";

const ScrollChat = ({messages}) => {
    const { user } = useSelector(state => state.chat);
  return (
  <ScrollableFeed>
    {messages &&
      messages.map((m, i) => (
        <div style={{ display: 'flex'  }} key={m._id}>
          {(isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id)) && (
            <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
              <Avatar
                pic={m.sender.pic}
                name={m.sender.name} 
                className="p-mr-2"
                size="small"
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          )}
          <span style={{
            backgroundColor: `${
               m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0" 
            }`,
            borderRadius: '20px',
            padding: '5px 15px',
            maxWidth: '75%',
            marginRight: '40px',
            marginLeft: isSameSenderMargin(messages, m, i, user._id),
            marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
          }}>
            {m.content}

          </span>
        </div>
      ))}
  </ScrollableFeed>
);
};

export default ScrollChat