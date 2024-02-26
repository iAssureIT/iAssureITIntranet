import logo from './logo.svg';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import Layout from './Layout.js';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
// axios.defaults.baseURL = "http://localhost:3065"
// console.log("NotificationEvents => ",NotificationEvents);


axios.defaults.headers.post['Content-Type'] = 'application/json';
console.log("process.env.REACT_APP_BASE_URL = ", axios.defaults.baseURL);

function App() {
  const [open,setOpen] = useState(true);
  const Menus =[
    {title:"DASHBOARD",src:faGlobe},
    {title:"ADMIN",src:faUser},
    {title:"HUMAN RESOURSE",src:faUserShield},
    {title:"IT",src:faBars},
    {title:"DELIVERY DEPARTMENT",src:faBars},
  ]
  
  console.log("length",Menus.map((menu,index)=>menu.title));
  return (
    <div className="App flex">
      <Layout />
    </div>
  );
}

export default App;
