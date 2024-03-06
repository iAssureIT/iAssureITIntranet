import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faAngleLeft,faAngleRight,faBuilding,faUserTie, faUsers, faDashboard} from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';

 import {Link} from 'react-router-dom';

import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";



const SideBar=({handleCallback,openSidebar})=>{
    const [open,setOpen] = useState(false);
    const [openlist, setOpenList] = React.useState(0);
 
    const handleOpen = (value) => {
      setOpenList(openlist === value ? 0 : value);
    };

    useEffect(() => {
        setOpen(openSidebar);
    },[openSidebar]);
    const Menus =[
        {title:"DASHBOARD",src:faGlobe,link:"dashboard"},
        {title:"ADMIN",src:faUser,link:"admin"},
        {title:"HUMAN RESOURSE",src:faUserShield,link:"humanresource",
            submenu:[
              {title:"Policy",link:'policy'},
              {title:"Apllication",link:'leavemanagement'},
              {title:"Pending Request",link:'pendingrequest'}
          ]},
        {title:"IT",src:faUserTie,link:"itpage"},
        {title:"DELIVERY",src:faBuilding,link:"deliveryDepartment"},
        {title:"MASTERS",src:faDashboard,link:"masters"},
        {title:"USER MANAGEMENT",src:faUsers,link:"usermanagement"},
    ]

  const handleDrawer = (open) =>{
    console.log("handle drawer ==", open);
    setOpen(open);
    handleCallback(open);
  }

  console.log("opem===>",open);


  return(
<div className= 'w-full h-screen bg-white-500 relative duration-300'>
       {open ?
       <div className='flex-none p-1 flex items-center border-b-2'> 
            <div className='flex items-center content-center mx-auto'>
                <img src="/images/iAssureIT_Logo.png"  className='w-32 h-16 ml-4'/>
            </div>
        </div>  
            :
       <div className='h-8 w-8 mx-auto py-8'>   
            {/* <FontAwesomeIcon  className='cursor-pointer -right-3 top-9 w-7 border-dark-purple  float-start h-5'  icon={faAngleRight} color='#000' onClick={()=>handleDrawer(!open)}/>  */}
            <img src="/images/Fevicon/iAssureIT_Fevicon1.png"  className='cursor-pointer -right-3  w-7 border-dark-purple  float-start h-7'/>
        </div>  
       }
       <List>
       {Menus&& Menus.length>0 && Menus.map((menu,index)=>{
            return(
            <Accordion
              open={openlist ===  index+1}
              icon={
                menu?.submenu && menu?.submenu &&
                    <ChevronDownIcon
                      strokeWidth={2.5}
                      className={!open  ? 'hidden':`mx-auto h-4 w-4 transition-transform ${openlist === index+1 ? "rotate-180" : ""}`}
                    />
              }
            >
              <Link to={'/'+menu.link}>
              <ListItem  className="p-0" selected={openlist === index+1}>
                <AccordionHeader onClick={() => handleOpen(index+1)} className="border-b-0 p-3">
                  <ListItemPrefix>
                    <FontAwesomeIcon  className=' cursor-pointer -right-3 top-9 w-5 h-5 '  icon={menu.src} color='#000' /> 
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    <span className={!open ? 'hidden': 'origin-left duration-200'}>{menu.title}</span>
                  </Typography>
                </AccordionHeader>
              </ListItem>
              </Link>
              
              <AccordionBody className={!open ? 'hidden':"py-1"}>
              {menu?.submenu && menu?.submenu.length>0 && menu.submenu.map((submenu,sub_index)=>{
              return(
                <List className="p-0">
                  <Link to={'/'+submenu.link}>
                  <ListItem>
                    <ListItemPrefix>
                      <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                    </ListItemPrefix>
                    {submenu.title}
                  </ListItem>
                  </Link>
                </List>
              )})}
              </AccordionBody>
            </Accordion>
          )})}
          </List>
       {/* <nav>
        <ul className='pt-0 nav justify-center '>
          {Menus&& Menus.length>0 && Menus.map((menu,index)=>{
            return(
                <Link to={'/'+menu.link}>
                  <li key={index} className=' text-sm flex mt-4 items-center gap-x-4 cursor-pointer p-4 hover:bg-light-white rounded-md'>
                  <FontAwesomeIcon  className=' cursor-pointer -right-3 top-9 w-7 h-5 '  icon={menu.src} color='#000' /> 
                  <span className={!open ? 'hidden': 'origin-left duration-200'}>{menu.title}</span>
                  <ul>
                      <li><a href="history">Our History</a></li> 
                      <li><a href="team">Our Team</a></li>
                    </ul>
                </li>
                  </Link>
    
                )
            })}
        </ul>  
        </nav> */}
       </div>
)}    
export default SideBar;  