import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCalendarDay,faFileCircleCheck,faDollarSign,faFile,faRightFromBracket} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon ,DocumentIcon,EyeIcon} from "@heroicons/react/24/solid";
import axios from 'axios';
import swal from 'sweetalert';
import { DocumentViewer } from 'react-documents';
import {useNavigate,useLocation} from 'react-router-dom';
import LeaveApplication from './LeaveApplication';
import moment from 'moment';

const TABLE_HEAD = ["SR. No.",  "Employee Name","Leave Type","Leave From Date","Leave To Date","Total Leaves","Leave Reason","Actions"];
const TABLE_BODY = [];

function PendingRequestView() {
    const [open,setOpen] = useState(true);
    const [modal,openModal] =useState(false);
    const [remark,setRemark] =useState(false);
    const { state } = useLocation();
    const [leaveData,setLeaveRequestData] = useState(state)
    console.log("leaveData",leaveData);
    const navigate = useNavigate();


      useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        getSingleLeaveInfo(leaveData._id)
    }, [1]);

    var a = moment(leaveData.fromDate);
    var b = moment(leaveData.toDate);      
    var difference = b.diff(a, 'days')

    const changeStatus=(status)=>{
        console.log("status",status);
        var formValues ={
            status : status,
            leave_id : leaveData._id,
            remark : remark
        }
        axios.patch('/api/leaveApplication/update/status',formValues)
        .then(res=>{
            swal({
                text: res.data.message
            });
            getSingleLeaveInfo(state._id)

        })
        .catch(err=>{
            console.log("err",err);
        })
    }

    const getSingleLeaveInfo =(leave_id)=>{
        axios.get('/api/leaveApplication/singleleave/'+leave_id)
        .then(res=>{
            setLeaveRequestData(res.data);
        })
        .catch(err=>{
            console.log("err",err);
        })
    }

  return (
    <div className=" p-4    ">
    <div className='bg-white min-height-full rounded-xl shadow-lg py-4 px-8'>
        <div className='flex border-b-2 justify-between  py-3'>
            <div className="text-xl font-extrabold ">Pending Leave Approval</div>
            <span className={leaveData.status === "Pending" ?
                   "inline-flex items-center bg-yellow-100 text-yellow-800  text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300"
                   :
                   leaveData.status === "Approved" ?
                       "inline-flex items-center bg-green-100 text-green-800  text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
                :
                "inline-flex items-center bg-red-100 text-red-800  text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300"

                }>
                {leaveData.status}
            </span>       
             </div>
       <div className='grid grid-cols-4'>
          <div className='mt-6'>
             <div className="text-lg font-medium">Employee Name</div>
             <div className='font-normal'>{leaveData.user_name}</div>
          </div>
          <div className='mt-6'>
             <div className="text-lg font-medium">Employee Id</div>
            <div className='font-normal'>EMP101</div>
            </div>
             <div className='mt-6'>
                <div className="text-lg font-medium">Leaves From</div>
                <div className='font-normal'>{moment(leaveData.fromDate).utc().format('DD-MM-YYYY')}</div>
             </div>
             <div className='mt-6'>
                 <div className="text-lg font-medium">Leaves To</div>
                <div className='font-normal'>{moment(leaveData.toDate).utc().format('DD-MM-YYYY')}</div>
             </div>
       </div>
       <div className='grid grid-cols-4'>

        <div className='mt-6'>
            <div className="text-lg font-medium">Total Days</div>
            <div className='font-normal'>{difference}</div>
        </div>

        <div className='mt-6'>
            <div className="text-lg font-medium">Work Backup</div>
            <div className='font-normal'>NA</div>
        </div>
        <div className='mt-6'>
            <div className="text-lg font-medium">Reporting Manager</div>
            <div className='font-normal'>{leaveData.manager_name}</div>
        </div>
        </div>
      
        <div className='grid grid-cols-2'>
            <div className='mt-6 flex gap-6'>
                <div className="text-lg font-medium">Leave Type</div>
                <div className="text-lg font-medium"> : </div>
                <div className='text-lg font-normal'> {leaveData.leaveType}</div>
            </div>
        </div>
        <div className='grid grid-cols-2'>
            <div className='mt-6 flex gap-6'>
                <div className="text-lg font-medium">Subject</div>
                <div className="text-lg font-medium"> : </div>
                <div className='text-lg font-normal'> {leaveData.leaveSubject}</div>
            </div>
        </div>
        <div className='grid grid-cols-2'>
            <div className='mt-6 flex gap-6'>
                <div className='font-normal'> <p dangerouslySetInnerHTML={{ __html: leaveData.leaveSummary }} className="textAreaBox"></p></div>
            </div>
        </div>
        <div>
        <div className='mt-6'>
             {leaveData.status === "Pending" ?
             <>
                <label for="leaveRemark" className="block mb-2 text-lg font-medium text-gray-900 dark:text-white">Leave Remark</label>
                <textarea type="text" id="leaveRemark" onChange={(e)=>setRemark(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" > </textarea>
            </>
            :
                <div className='flex gap-6'>
                    <label for="leaveRemark" className="block mb-2 text-lg font-medium">Leave Remark</label>
                    <div className="text-lg font-semibold"> : </div>
                    <div className='text-lg font-normal'> {leaveData.remark}</div>
                </div>
         }
            </div>
    </div>
        
        {leaveData.status === "Pending" &&<div className="flex justify-center gap-6 mt-6">
            <button type="button"  onClick={()=>changeStatus('Approved')} className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-blue-800">Approve</button>
            <button type="button"  onClick={()=>changeStatus('Rejected')} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-blue-800">Reject</button>
        </div>}
    </div>
 </div>
  );
}

export default PendingRequestView;
