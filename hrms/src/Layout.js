import SideBar from './components/SideBar/SideBar';
import HeaderView from './components/HeaderView/HeaderView';
import Dashboard from './pages/Dashboard/Dashboard';
import Admin from './pages/Admin/Admin';
import IT from './pages/IT/IT';
import DeliveryDepartment from './pages/DeliveryDepartment/DeliveryDepartment';
import HumanResource from './pages/HumanResource/HumanResource';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import Masters from './pages/Masters/Masters';
import UserManagement from './pages/UserManagement/UserManagement';
import OnBoardingForm from './pages/OnBoardingForm/OnBoardingForm';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Policy from './pages/HumanResource/Policy';
import PolicyView from './pages/HumanResource/PolicyView';
import ApplicationMangement from './pages/ApplicationManagement/ApplicationManagement';
import EmployeeChart from './pages/OrgChart/EmployeeChart';
const Layout = ({ children }) => {
    console.log("children",children);
    const [open,setOpen]=useState(false);
    const [loggedIn,setLoggedIn]=useState(false);
    const [approvalStatus,setApprovalStatus]=useState("");
    const handleCallback = (childData) => {
        console.log("childData",childData);
        setOpen(childData)
        // Update the name in the component's state
    };


    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        setApprovalStatus(data?.approvalStatus);
        setLoggedIn(data);
      },[1]);


    if(loggedIn && approvalStatus !== "Pending"){
    return (
        <>
            <Router>
                <div className={open ? 'flex-none w-[20%] h-screen':'flex-none w-[5%] h-screen'}>
                    <SideBar handleCallback={handleCallback} openSidebar={open}/>
                </div>
                <div className={open ? 'flex-none w-[80%] h-screen':'flex-none w-[95%] h-screen'}>
                    <div >
                        <HeaderView handleCallback={handleCallback}/>
                    </div>
                    <div className='bg-blue-100'>
                        <Routes >
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/" element={<Dashboard />} exact />
                            <Route path="/dashboard" element={<Dashboard />} exact />
                            <Route path="/policy" element={<Policy />} exact />
                            <Route path="/policy_view" element={<PolicyView />} exact />
                            <Route path="/leavemanagement" element={<ApplicationMangement />} exact />
                            <Route path="/itpage" element={<IT />} exact />
                            <Route path="/deliveryDepartment" element={<DeliveryDepartment />} exact />
                            <Route path="/humanresource" element={<HumanResource />} exact />
                            <Route path="/profile" element={<Profile />} exact />
                            <Route path="/usermanagement" element={<UserManagement />} exact />
                            <Route path="/masters" element={<Masters />} exact />
                            <Route path="/orgchart" element={<EmployeeChart />} exact />
                        </Routes>
                    </div>
                </div>
            </Router>
        </>
    )
    } else if (approvalStatus === 'Pending') {
            return (
                <>  
                 <Router>
                    <div className={'flex-none w-[100%]'}>
                        <div >
                            <HeaderView handleCallback={handleCallback}/>
                        </div>
                            <div className='flex-none w-full'>
                                <div >
                                    <Routes >
                                        <Route path="/onBoardingForm" element={<OnBoardingForm/>} exact />
                                        <Route path="/" element={<OnBoardingForm/>} exact />
                                    </Routes>
                                </div>
                            </div>
                    </div>
                    </Router>
                </>
            )
        }else {
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
            )
        }
}

export default Layout
