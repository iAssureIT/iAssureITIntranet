import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faAngleLeft,faAngleRight} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

 import {Link} from 'react-router-dom';



function SideBar(){
    const [open,setOpen] = useState(true);
  const Menus =[
    {title:"DASHBOARD",src:faGlobe,link:"dashboard"},
    {title:"ADMIN",src:faUser,link:"admin"},
    {title:"HUMAN RESOURSE",src:faUserShield,link:"humanresource"},
    {title:"IT",src:faBars,link:"itpage"},
    {title:"DELIVERY DEPARTMENT",src:faBars,link:"deliveryDepartment"},
  ]
  return(
<div className={open ?
        'w-96 h-screen bg-site relative duration-300'
        :
        'w-12 h-screen bg-site relative duration-300'
        } >
       {open ?
       <div className='flex-none p-2 flex items-center border-y-2'> 
            <div className='flex items-center content-center mx-auto'>
                <img src="/images/iAssureIT_White_Logo.png"  className='w-32 h-16 mr-2'/>
            </div>
            <span className='ml-auto'>
                <FontAwesomeIcon  className='w-7 h-5 cursor-pointers border-dark-purple '  icon={faAngleLeft} color='#fff' onClick={()=>setOpen(!open)}/> 
            </span>
        </div>  
            :
       <div className='h-8 w-8 mx-auto my-8'>   
            <FontAwesomeIcon  className='cursor-pointer -right-3 top-9 w-7 border-dark-purple  float-start h-5'  icon={faAngleRight} color='#fff' onClick={()=>setOpen(!open)}/> 
        </div>  
       }
      <ul className='pt-0'>
        {Menus&& Menus.length>0 && Menus.map((menu,index)=>{
          return(
            <div>
               <Link to={'/'+menu.link}>
                <li key={index} className='text-gray-300 text-sm flex mt-4 items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md'>
              <FontAwesomeIcon  className=' cursor-pointer -right-3 top-9 w-7 h-5 '  icon={menu.src} color='#fff' onClick={()=>setOpen(!open)}/> 
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