import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faAngleLeft,faAngleRight,faBuilding,faUserTie, faUsers, faDashboard} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

 import {Link} from 'react-router-dom';



const SideBar=({handleCallback})=>{
    const [open,setOpen] = useState(false);
    const Menus =[
        {title:"DASHBOARD",src:faGlobe,link:"dashboard"},
        {title:"ADMIN",src:faUser,link:"admin"},
        {title:"HUMAN RESOURSE",src:faUserShield,link:"humanresource"},
        {title:"IT",src:faUserTie,link:"itpage"},
        {title:"DELIVERY DEPARTMENT",src:faBuilding,link:"deliveryDepartment"},
        {title:"MASTERS",src:faDashboard,link:"masters"},
        {title:"USER MANAGEMENT",src:faUsers,link:"usermanagement"},
    ]

  const handleDrawer = (open) =>{
    console.log("handle drawer ==", open);
    setOpen(open);
    handleCallback(open);
  }

  return(
<div className= 'w-full h-screen bg-site relative duration-300'>
       {open ?
       <div className='flex-none p-1 flex items-center border-b-2'> 
            <div className='flex items-center content-center mx-auto'>
                <img src="/images/iAssureIT_White_Logo.png"  className='w-32 h-16 ml-4'/>
            </div>
            <span className='ml-auto'>
                <FontAwesomeIcon  className='w-7 h-5 cursor-pointer border-dark-purple '  icon={faAngleLeft} color='#fff' onClick={()=>handleDrawer(!open)}/> 
            </span>
        </div>  
            :
       <div className='h-8 w-8 mx-auto py-8'>   
            <FontAwesomeIcon  className='cursor-pointer -right-3 top-9 w-7 border-dark-purple  float-start h-5'  icon={faAngleRight} color='#fff' onClick={()=>handleDrawer(!open)}/> 
        </div>  
       }
      <ul className='pt-0  justify-center '>
        {Menus&& Menus.length>0 && Menus.map((menu,index)=>{
          return(
            <div>
               <Link to={'/'+menu.link}>
                <li key={index} className='text-white text-sm flex mt-4 items-center gap-x-4 cursor-pointer p-4 hover:bg-light-white rounded-md'>
              <FontAwesomeIcon  className=' cursor-pointer -right-3 top-9 w-7 h-5 '  icon={menu.src} color='#fff' /> 
              <span className={!open ? 'hidden': 'origin-left duration-200'}>{menu.title}</span>

                </li>
                </Link>
          </div>

              )
          })}
      </ul>  
       </div>
)}    
export default SideBar;  