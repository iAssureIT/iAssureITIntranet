import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faBell,faSignOut} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip  } from 'react-tooltip';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';




function HeaderView(){
const navigate = useNavigate();

const logOut =()=>{
  localStorage.removeItem('loggedIn');
  navigate('/login');
  window.location.reload();
}

    const [open,setOpen] = useState(true);
  return(
    <div className='bg-site p-2 flex items-center w-full border-b-2' >
        <div className='ml-auto pr-2'>
        <FontAwesomeIcon  className='w-10 h-8 cursor-pointers justify-end mr-8 p-2'  icon={faBell} color='#fff' onClick={()=>setOpen(!open)}/> 
        <FontAwesomeIcon  className='w-8 h-8 cursor-pointers bg-red-500 justify-end border rounded-full rounded p-2' id="clickable"  data-tooltip-place="top" icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
        </div>
        <hr/>
        <Tooltip anchorSelect="#clickable" place="bottom" effect="solid" className="tooltip " clickable>
        <div className="flex items-center">
          {/* User image and details */}
          <div className="rounded-full mr-4">
            {/* <img src={user.img} alt="User Profile" className="w-12 h-12" /> */}
            <FontAwesomeIcon  className='w-10 h-10 cursor-pointers rounded-full bg-red-500 justify-end border  p-2' data-tip data-for="userTooltip" icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
          </div>
          <div>
            <div className="font-bold">Rushikesh Salunkhe</div>
            <div>rushikesh.salunkhe@iassureit.com</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex">
          {/* My Profile button */}
          <Link to='/profile'><button className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-full mr-2" >
            {/* <img src="profile-icon.png" alt="My Profile" className="w-4 h-4 mr-2" /> */}
           <FontAwesomeIcon  className="object-cover md:rounded-none md:rounded-s-lg" height={50} width={50} icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
            My Profile
          </button></Link>

          {/* Sign Out button */}
          <button className="flex items-center float-end bg-red-500 text-white py-2 px-4 rounded-full" onClick={()=>logOut()}>
          <FontAwesomeIcon  className="object-cover md:rounded-none md:rounded-s-lg" height={50} width={50} icon={faSignOut} color='#fff' /> 
            Sign Out
          </button>
        </div>
      </Tooltip>
    </div>
)}    


export default HeaderView;  