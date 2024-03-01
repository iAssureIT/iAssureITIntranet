import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser,faUsers,faCalendarDay,faFileCircleCheck,faDollarSign,faFile,faRightFromBracket} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
function HumanResource() {
    const [open,setOpen] = useState(true);
  return (
    <div className="w-full App ">
      
     
      <div className='p-7 text-xl font-semibold  h-screen'>
       <div className='grid  grid-cols bg-grey-200 mb-8'>
       <span className='text-left'>Human Resource</span>
       </div>
        <div className="grid grid-cols-3 gap-4 divide-x">
        <a href="/policy" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-36">
            {/* <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="./assets/iAssureIT_Logo.png" alt=""/> */}
            <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faFileCircleCheck} color='#000' onClick={()=>setOpen(!open)}/> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">POLICY</h5>
            </div>
        </a>
        <a href="/leavemanagement" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faRightFromBracket} color='#000' onClick={()=>setOpen(!open)}/> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">LEAVE</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
          <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faDollarSign} color='#000' onClick={()=>setOpen(!open)}/> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">PAYROLL</h5>
            </div>
        </a>
        </div>
        <div className="grid grid-cols-3 gap-4 divide-x mt-8">
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-36">
          <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faCalendarDay} color='#000' onClick={()=>setOpen(!open)}/> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">ATEENDANCE</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
        <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faFile} color='#000' onClick={()=>setOpen(!open)}/> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">UPLOAD DOCUMENTS</h5>
            </div>
        </a>
        </div>
        </div>

    </div>
  );
}

export default HumanResource;
