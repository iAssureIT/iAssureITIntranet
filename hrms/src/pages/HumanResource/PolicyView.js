import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faFileCircleCheck, faDollarSign, faFile, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import { faPencil, faUser } from '@fortawesome/free-solid-svg-icons'
import { Button, Modal } from 'flowbite-react';
import { Card, Typography, Tooltip, IconButton } from '@material-tailwind/react';
import { PencilIcon, TrashIcon, DocumentIcon } from "@heroicons/react/24/solid";
import AddPolicy from './AddPolicy';
import axios from 'axios';
import swal from 'sweetalert';
import { DocumentViewer } from 'react-documents';
import { useLocation } from 'react-router-dom';
const TABLE_HEAD = ["SR. No.", "POLICY NAME", "CATEGORY", "POLICY SUMMARY", "DOCUMENTS", "ACTIONS"];

function PolicyView() {
   const { state } = useLocation();
   console.log("state", state);
   const [open, setOpen] = useState(true);
   const [modal, openModal] = useState(false);
   const [policyList, setPolicyList] = useState([]);
   const [edit, setEdit] = useState(false);
   const [policy, setPolicy] = useState('');

   useEffect(() => {
      var user = JSON.parse(localStorage.getItem('userDetails'));
   }, [1]);



   return (
      <div className=" h-screen p-4    ">
         <div className='bg-white rounded-xl shadow-lg py-4 px-8'>
            <div className="text-xl font-extrabold border-b-2 py-3">Policy Preview</div>
            <div className='grid grid-cols-3'>

               <div>
                  <div className="text-lg font-medium">Policy Name</div>
                  <div className='font-normal'>{state.policy_name}</div>
               </div>
               <div>
               <div className="text-lg font-medium">Category</div>
                  <div className='font-normal'>{state.policy_category}</div>
               </div>

               <div>

               </div>
            </div>
            <div className=' bg-grey-200 py-4 '>
               <span className='text-left text-xl'> Policy Name</span>
               <span className='text-left'> : </span>
            </div>
            <div className=' bg-grey-200  py-4 '>
               <span className='text-left text-xl'> Policy </span>
               <span className='text-left'> : </span>
            </div>
            <div className=' bg-grey-200  py-4 '>
               <span className='text-left text-xl'> Policy Summary</span>
               <span className='text-left'> : <p dangerouslySetInnerHTML={{ __html: state.policy_summary }} className="textAreaBox"></p></span>
            </div>
            <div className=' bg-grey-200  '>
               <span className='text-left text-xl'> Policy Document</span>
            </div>
            <div className='w-1/2'>
               <DocumentViewer

                  queryParams="hl=Nl"
                  url={"https://www.clickdimensions.com/links/TestPDFfile.pdf"}>
               </DocumentViewer>
            </div>
         </div>
      </div>
   );
}

export default PolicyView;
