import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';

function Dashboard() {
    const [open,setOpen] = useState(true);
  return (
    <div className="w-full App ">
      
     
      <div className='p-7 text-xl font-semibold  h-screen'>
       <div className='grid  grid-cols bg-grey-200 mb-8'>
       <span className='text-left'>DASHBOARD</span>
       </div>
        <div className="grid grid-cols-3 gap-4 divide-x ">
        <a href="/Profile" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ">
            <div className="flex  bg-blue-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex  flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">USER</h5>
            </div>
        </a> 
        {/* <StatBox 
            icon    =   {faUser}
            url     =   "/Profile"
            name    =   'USER'
            count   =    '0'
        /> */}
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <div className="flex  bg-green-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faUsers} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">EMPLOYEE</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <div className="flex  bg-red-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faClipboardUser} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">EVENT</h5>
            </div>
        </a>
        </div>
        <div className="grid grid-cols-3 gap-4 divide-x mt-8">
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-36">
            <div className="flex  bg-yellow-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faCalendarDay} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">ATEENDANCE</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <div className="flex  bg-purple-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faThumbsUp} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">HOLIDAYS</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <div className="flex  bg-orange-300 w-36 h-full items-center">
                <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faBars} color='#fff' onClick={()=>setOpen(!open)}/> 
            </div>
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">DEPARTMENT</h5>
            </div>
        </a>
        </div>
        </div>

    </div>
  );
}

export default Dashboard;
