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
import LeaveApplication from './LeaveApplication';
const TABLE_HEAD = ["SR. No.",  "APLICATION TYPE","APPLICATION"];
const TABLE_BODY = [
    {"type" : "Leave Application"},
    {"type" : "Perfomance Appraisal"},
    {"type" : "Reimbursement Form"},
    {"type" : "Asset Request Form"},
];

function ApplicationMangement() {
    const [open,setOpen] = useState(true);
    const [modal,openModal] =useState(false);
    const [edit,setEdit] =useState(false);
    const [application,setApplication] = useState('')
    const navigate = useNavigate();


    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
      },[1]);



   



  return (
    <div className="w-full App p-4">
      <div className='text-xl font-semibold mb-8'>
        <div className='grid  grid-cols bg-grey-200 '>
                <span className='text-left'>Application Managment</span>
        </div>
     </div>
    <Card className=" overflow-scroll">
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
                {TABLE_BODY && TABLE_BODY.length>0?
                TABLE_BODY.map(({ type }, index) => {
                const isLast = index === TABLE_BODY.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

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
                        {type}
                        </Typography>
                    </td>
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                         <Button className="bg-site" onClick={() => {openModal(true);setApplication(type)}}>APPLY</Button>
                        </Typography>
                    </td>
                   
               
                   
                    </tr>
                );
                })
                :
                []
            } 
            </tbody>
            </table>
    </Card>
    <Modal show={modal} onClose={() => openModal(false)}>
        <Modal.Header>{application}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
              <LeaveApplication />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ApplicationMangement;
