import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
function Dashboard() {
    const [open,setOpen] = useState(true);
  return (
    <div className="w-full App ">
      <div className='p-7 text-xl font-semibold  h-screen'>
       <div className='grid  grid-cols bg-grey-200 mb-8'>
       <p className='text-xl text-left'>Profile</p>
       </div>
            <h1 className='text-xl text-red-600'>WELCOME</h1>    
            <div className='mt-8 flex items-center mb-8'>
                <img src='/images/user.jpeg'  alt="User Profile" className="w-24 h-24 rounded-full" /> 
                <div className='ml-4'>
                    <p className='text-lg font-bold'>Rushikesh Salunkhe</p>
                    <p className='text-lg font-light'>Sr. Software Devloper</p>
                </div>    
            </div>   

            <div className=" container m-auto grid grid-cols-4">
                <div className="flex flex-col items-center justify-center border-0">
                    <div className="flex flex-col items-center p-4 leading-normal border-0">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">EMPLOYEE ID</h5>
                        <h5 className="mb-2 text-xl  tracking-tight text-gray-900 dark:text-white">EMP0001</h5>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center border-0">
                    <div className="flex flex-col items-center p-4 leading-normal border-0">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">CONTACT DETAILS</h5>
                        <h5 className="mb-2 text-xl  tracking-tight text-gray-900 dark:text-white">9322664533</h5>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white ">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">EMPLOYEE STATUS</h5>
                        <h5 className="mb-2 text-xl  tracking-tight text-gray-900 dark:text-white">Confirmed</h5>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <span className="mb-2  tracking-tight text-gray-900 dark:text-white">LOCATION</span>
                        <span className="mb-2  tracking-tight text-gray-900 dark:text-white">PUNE</span>
                    </div>
                </div>
             </div>
        

            <div className="grid grid-cols-4 gap-4 mt-8 divide-x">
                <a href="#" className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-36">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">LEAVE WITHOUT PAY</h5>
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">02/22</h5>
                    </div>
                </a>
                <a href="#" className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">CASUAL LEAVE</h5>
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">03/05</h5>
                    </div>
                </a>
                <a href="#" className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">HOLIDAYS</h5>
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">04/10</h5>
                    </div>
                </a>
                <a href="#" className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700  h-36">
                    <div className="flex flex-col items-center p-4 leading-normal">
                        <span className="mb-2  tracking-tight text-gray-900 dark:text-white">WORK FROM HOME</span>
                        <span className="mb-2  tracking-tight text-gray-900 dark:text-white">00/03</span>
                    </div>
                </a>
             </div>
        </div>

    </div>
  );
}

export default Dashboard;
