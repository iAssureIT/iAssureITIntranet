import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
function StatBox(props) {
    console.log("props",props);
  return (
    <a href="/Profile" className="flex flex-col items-center bg-white border border-gray-200 shadow-md rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ">
        {/* <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="./assets/iAssureIT_Logo.png" alt=""/> */}
        <div className="flex  bg-blue-300 w-36 h-full items-center">
            <FontAwesomeIcon  className="object-cover w-full rounded-t-lg h-8  md:w-48 md:rounded-none md:rounded-s-lg" height={100} width={100} icon={faUser} color='#fff'/> 
        </div>
        <div className="flex  flex-col justify-between p-4 leading-normal">
            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">USER</h5>
        </div>
    </a>
  );
}

export default StatBox;
