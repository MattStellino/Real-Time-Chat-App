import React, { useState, useEffect } from 'react';
import { Card} from 'primereact/card';
import Login from '../Components/Login';
import Signup from '../Components/Signup';
import { SelectButton } from 'primereact/selectbutton';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles.css'
import 'primereact/resources/themes/saga-blue/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import 'primeflex/primeflex.css';

const Homepage = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const options = [
    { label: 'Login', value: 'login' },
    { label: 'Signup', value: 'signup' }
  ];

  const navigate = useNavigate();
  const { user, initialCheckDone } = useSelector((state) => state.auth); 
  useEffect(() => {
    if (initialCheckDone && user) {
      navigate("/chats"); 
    }
  }, [user, initialCheckDone, navigate]);

  const selectButtonTemplate = (option) => {
    return (
      <React.Fragment>
        <span className="p-button-label">{option.label}</span>
      </React.Fragment>
    );
  };

  const header = (
    <SelectButton value={selectedOption} options={options} onChange={(e) => setSelectedOption(e.value)} itemTemplate={selectButtonTemplate} />
  );

  return (
    <div className="home-con p-grid button-switch" style={{ width: '100vw'}}>
      <div className="p-col-12 p-md-8 p-lg-6 p-xl-4  ">
        <Card title="Welcome" subTitle="Please select an option" header={header} className ='p-shadow-10 's>
          {selectedOption === 'login' && <div><Login/></div>}
          {selectedOption === 'signup' && <div><Signup/></div>}
        </Card>
      </div>
    </div>
  );
}

export default Homepage;
