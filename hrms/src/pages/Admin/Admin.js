import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
function Admin() {
    const [open,setOpen] = useState(true);
  return (
    <div className="w-full App ">
      
     
      <div className='p-7 text-xl font-semibold  h-screen'>
       <div className='grid  grid-cols bg-grey-200 mb-8'>
       <span className='text-left'>ADMIN</span>
       </div>
       <div className="grid grid-cols-2 gap-4 divide-x w-full">
        <a href="#" className="w-full flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-36">
            {/* <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="./assets/iAssureIT_Logo.png" alt=""/> */}
            <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faCalendarDay} color='#000' /> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">ATTENDANCE</h5>
            </div>
        </a>
        <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
            <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faBars} color='#000' /> 
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">DEPARTMENT</h5>
            </div>
        </a>
        </div>
        </div>

    </div>
  );
}

export default Admin;
