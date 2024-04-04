import MyChats from "../Components/MyChats";
import Chatbox from "../Components/Chatbox";
import Header from "../Components/Header";
import { Card } from 'primereact/card';
import React, { useState } from "react";
import { useSelector } from 'react-redux';

const Chatpage = () => {

  const [fetchAgain, setFetchAgain] = useState(false);
  // Inline selector to check the authentication status
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  console.log(isAuthenticated)

 return (
  <div style={{ 
    width: '100%',
    height: '100vh',
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#038037',
    color: 'black', 
    fontFamily: 'Monospace   ', 
    }}>
    {isAuthenticated && (
      <div style={{ 
      width: '100%',
      borderBottom: '1px solid mediumseagreen',
      paddingBottom: '20px',
      paddingTop: '0px', }}>
        <Header />
      </div>
    )}

    <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}> 
      {isAuthenticated && (
        <Card style={{ 
          height: '78vh',
          width: '25%', overflowY: "hidden",
          border: '1px solid mediumseagreen'
            }}>
          <MyChats fetchAgain={fetchAgain} />
        </Card>
      )}

      {isAuthenticated && (
        <div style={{ flex: 1,
         backgroundColor: '#038037'
         }}> 
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
      )}
    </div>
  </div>
);



};

export default Chatpage;
