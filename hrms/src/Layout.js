import SideBar from './components/SideBar/SideBar';
import HeaderView from './components/HeaderView/HeaderView';
import Dashboard from './pages/Dashboard/Dashboard';
import Admin from './pages/Admin/Admin';
import IT from './pages/IT/IT';
import DeliveryDepartment from './pages/DeliveryDepartment/DeliveryDepartment';
import HumanResource from './pages/HumanResource/HumanResource';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Layout = ({ children }) => {
    console.log("children",children);
    const [open,setOpen]=useState(false);
    const [loggedIn,setLoggedIn]=useState(false);
    const handleCallback = (childData) => {
        console.log("childData",childData);
        setOpen(childData)
        // Update the name in the component's state
    };

    useEffect(() => {
        var data = localStorage.getItem('loggedIn');
        console.log("data",data);
        setLoggedIn(data);
      });


    if(loggedIn){
    return (
        <>
            <Router>
                <div className={open ? 'flex-none w-[20%]':'flex-none w-[5%]'}>
                    <SideBar handleCallback={handleCallback}/>
                </div>
                <div className={open ? 'flex-none w-[80%]':'flex-none w-[95%]'}>
                    <div >
                        <HeaderView />
                    </div>
                    <div >
                        <Routes >
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/" element={<Dashboard />} exact />
                            <Route path="/dashboard" element={<Dashboard />} exact />
                            <Route path="/itpage" element={<IT />} exact />
                            <Route path="/deliveryDepartment" element={<DeliveryDepartment />} exact />
                            <Route path="/humanresource" element={<HumanResource />} exact />
                            <Route path="/profile" element={<Profile />} exact />
                        </Routes>
                    </div>
                </div>
            </Router>
        </>
    )
    }else{
        return (
        <>
        <Router>
            <div className='flex-none w-full'>
                <div >
                    <Routes >
                        <Route path="/" element={<Login />} exact />
                        <Route path="/login" element={<Login />} exact />
                    </Routes>
                </div>
            </div>
        </Router>
    </>
    )}
}

export default Layout
