import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCalendarDay,faFileCircleCheck,faDollarSign,faFile,faRightFromBracket} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon ,DocumentIcon,EyeIcon} from "@heroicons/react/24/solid";
import AddPolicy from './AddPolicy';
import axios from 'axios';
import swal from 'sweetalert';
import { DocumentViewer } from 'react-documents';
import {useNavigate} from 'react-router-dom';
const TABLE_HEAD = ["SR. No.",  "POLICY NAME","CATEGORY","POLICY SUMMARY","ACTIONS"];

function Policy() {
    const [open,setOpen] = useState(true);
    const [modal,openModal] =useState(false);
    const [policyList,setPolicyList] =useState([]);
    const [edit,setEdit] =useState(false);
    const [policy,setPolicy]=useState('');
    const navigate = useNavigate();


    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        getPolicyList();
      },[1]);


    const editPolicy=(data)=>{
        console.log("index",data);
        setEdit(true);
        openModal(true);
        axios.get('/api/policy/get/one/'+data._id)
        .then(res=>{
            setPolicy(res.data);
            console.log("res",res);
        })
        .catch(err=>{
            console.log("err",err)
        })

    }

    const deletePolicy=(data)=>{
        axios.delete('/api/policy/delete-policy/'+data._id)
        .then(res=>{
            swal({
                text: res.data.message
            });
            getPolicyList();
        })
        .catch(err=>{
            console.log("err",err)
        })

    }
    console.log("TABLE_HEAD",TABLE_HEAD);

    const getPolicyList =()=>{
        axios.get('/api/policy/policy_list')
        .then((res) => {
            setPolicyList(res.data)
        })
        .catch((err)=>console.log("err",err))
    }  
console.log("policyList",policyList);



  return (
    <div className="w-full h-full  p-4">
      <div className='text-xl font-semibold mb-8'>
        <div className='grid  grid-cols bg-grey-200 '>
            <span className='text-left'>Human Resource / Policy</span>
        </div>
       
        <div className='flex justify-between mt-8'>
            <Button className="bg-site" onClick={() => {openModal(true);setPolicy('')}}>Add Policy</Button>
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
                {policyList && policyList.length>0?
                policyList.map(({ policy_name,policy_category,policy_summary }, index) => {
                const isLast = index === policyList.length - 1;
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
                        {policy_name}
                        </Typography>
                    </td>
                    <td className={classes}>
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        >
                        {policy_category}
                        </Typography>
                    </td>
                   
                
                    <td className={classes} >
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal w-64"
                        >
                            <p  dangerouslySetInnerHTML={{ __html:policy_summary}} className="textAreaBox"></p>
                        </Typography>
                    </td>
                    <td className={classes}>
                        <IconButton variant="text" onClick={()=>editPolicy(policyList[index])}>
                            <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text"  onClick={()=>deletePolicy(policyList[index])}>
                            <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text"  onClick={()=>navigate('/policy_view',{state:policyList[index]})}>
                            <EyeIcon className="h-4 w-4" />
                        </IconButton>
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
    <Modal show={modal} onClose={() => {openModal(false);setEdit(false)}}>
        <Modal.Header>{edit? "Edit policy":"Add Policy"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <AddPolicy 
                edit={edit}
                policy={policy}
                setEdit={setEdit}
                getPolicyList={getPolicyList}
                openModal={openModal}
                />            
          </div>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>I accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Decline
          </Button>
        </Modal.Footer> */}
      </Modal>
    </div>
  );
}

export default Policy;
