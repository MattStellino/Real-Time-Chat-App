import React from 'react';
import { useSelector } from 'react-redux';
import 'primereact/resources/themes/saga-blue/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import SingleChat from './SingleChat'

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  
  
    return (
        <div
          style={{
          padding: '3em',
          backgroundColor: "white",
          width: "100%",
          borderRadius: "20px", // Rounded borders
          boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", // Adds shadow for a modern look
          border: "1px solid grey"
        }}
        >
          <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default Chatbox;
