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
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
import {
    TETabs,
    TETabsContent,
    TETabsItem,
    TETabsPane,
  } from "tw-elements-react";


const TABLE_HEAD = ["SR. No.",  "Employee Name","Leave Type","Leave From Date","Leave To Date","Total Leaves","Leave Reason","Actions"];
const TABLE_BODY = [];

function PendingRequest() {
    const [open,setOpen] = useState(true);
    const [modal,openModal] =useState(false);
    const [edit,setEdit] =useState(false);
    const [leaveData,setLeaveRequestData] = useState('');
    const [basicActive, setBasicActive] = useState("Pending");
    const navigate = useNavigate();



      useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
       getLeaveData('Pending');
    }, []);

    const getLeaveData=(status)=>{
        setBasicActive(status);
        axios.get('/api/leaveApplication/get/pending-request/'+status)
        .then(res => {
            console.log("res==========================", res.data);
            setLeaveRequestData(res.data.data)
        })
        .catch(err => {
            console.log("err", err);
        })
    }

  return (
    <div className="w-full App p-4 h-screen">
      <div className='text-xl font-semibold  '>
        <div className='grid  grid-cols bg-grey-200 '>
                <span className='text-left'>Pending Leave Approval</span>
        </div>
     </div>
       <TETabs>
        <TETabsItem
          onClick={() => getLeaveData("Pending")}
          active={basicActive === "Pending"}
        >
          Pending
        </TETabsItem>
        <TETabsItem
          onClick={() =>getLeaveData("Approved")}
          active={basicActive === "Approved"}
        >
          Approved
        </TETabsItem>
        <TETabsItem
          onClick={() => getLeaveData("Rejected")}
          active={basicActive === "Rejected"}
        >
          Rejected
        </TETabsItem>
      </TETabs>

      
        <Card className=" overflow-scroll mt-6">
            <table className="w-full min-w-max table-auto text-left">
            <thead>
                <tr>
                {TABLE_HEAD.map((head) => (
                    <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 bg-site"
                    >
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none  text-white"
                    >
                        {head}
                    </Typography>
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {leaveData && leaveData.length>0?
                leaveData.map(({ user_name,leaveType,fromDate,toDate,leaveSubject }, index) => {
                const isLast = index === leaveData.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                var a = moment(fromDate);
                var b = moment(toDate);      
                var difference = b.diff(a, 'days')
                return (
                    <tr key={index}>
                     <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {index+1}
                        </Typography>
                    </td>
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {user_name}
                        </Typography>
                    </td>
                     <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {leaveType}
                        </Typography>
                    </td> 
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {moment(fromDate).utc().format('DD-MM-YYYY',{required:false})}
                        </Typography>
                    </td> 
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {moment(toDate).utc().format('DD-MM-YYYY',{required:false})}
                        </Typography>
                    </td> 
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {difference}
                        </Typography>
                    </td> 
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {leaveSubject}
                        </Typography>
                    </td> 
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                         <Button className="bg-site" onClick={()=>navigate('/pendingrequestview',{state:leaveData[index]})} >View</Button>
                        </Typography>
                    </td>
                   
               
                   
                    </tr>
                );
            })
            :
            <tr >
                <td colSpan={8} >
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal text-center p-2"
                    >
                    NO LEAVE DATA FOUND
                    </Typography>
                </td>
                </tr>
        }
            </tbody>
            </table>
    </Card>
    </div>
  );
}

export default PendingRequest;
