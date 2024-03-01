import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCalendarDay,faFileCircleCheck,faDollarSign,faFile,faRightFromBracket} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon ,DocumentIcon} from "@heroicons/react/24/solid";
import AddPolicy from './AddPolicy';
import axios from 'axios';
import swal from 'sweetalert';
import { DocumentViewer } from 'react-documents';
import { useLocation } from 'react-router-dom';
const TABLE_HEAD = ["SR. No.",  "POLICY NAME","CATEGORY","POLICY SUMMARY","DOCUMENTS","ACTIONS"];

function PolicyView() {
  const { state } = useLocation();
  console.log("state",state);
    const [open,setOpen] = useState(true);
    const [modal,openModal] =useState(false);
    const [policyList,setPolicyList] =useState([]);
    const [edit,setEdit] =useState(false);
    const [policy,setPolicy]=useState('');

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
      },[1]);



  return (
    <div className="w-screen h-screen p-4">
      <div className=' bg-grey-200 py-4 '>
                <span className='text-left text-xl'> Policy Name</span>
                <span className='text-left'> : {state.policy_name}</span>
        </div>
        <div className=' bg-grey-200  py-4 '>
                <span className='text-left text-xl'> Policy Category</span>
                <span className='text-left'> : {state.policy_category}</span>
        </div>
        <div className=' bg-grey-200  py-4 '>
                <span className='text-left text-xl'> Policy Summary</span>
                <span className='text-left'> : <p  dangerouslySetInnerHTML={{ __html:state.policy_summary}} className="textAreaBox"></p></span>
        </div>
        <div className=' bg-grey-200  '>
                <span className='text-left text-xl'> Policy Document</span>
        </div>
        <DocumentViewer
            queryParams="hl=Nl"
            url={"https://www.clickdimensions.com/links/TestPDFfile.pdf"}>
        </DocumentViewer>
    </div>
  );
}

export default PolicyView;
