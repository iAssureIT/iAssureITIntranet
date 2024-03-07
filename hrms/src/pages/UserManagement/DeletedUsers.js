import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { PencilIcon, TrashIcon, Icon } from "@heroicons/react/24/solid";
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';


const TABLE_HEAD = ["Name", "Email", "Mobile Number","Role","Status", "Action"];


function DeletedUsers(props) {
    const [userList,setUserList] = useState([]);
    const [userId,setUserId]=useState('');
    const [deleteModal,setDeleteModal]=useState(false) ;
    const [restoreModal,setRestoreModal]=useState(false) ;


    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getDeletedUserList()
      },[]);

     

    const getDeletedUserList =()=>{
      var formValues ={
        companyID:1
      }
        axios.post('/api/users/post/deleteduser/list',formValues)
        .then((response) => {
            console.log("response",response);
            var userList = [];
            for (let index = 0; index < response.data.length; index++) {
                let userData ={
                    _id  : response.data[index]._id,                
                    name : response.data[index].fullName,
                    email:response.data[index].email,
                    mobile:response.data[index].mobNumber,
                    role:response.data[index].role,
                    status : response.data[index].status,
                    lastloggedin:response.data[index].lastLogin
                } 
                userList.push(userData);
            }
            setUserList(userList)
            console.log("userList",userList);
        })
        .catch((err)=>console.log("err",err))
    }

  
    const deleteUser=()=>{
        setDeleteModal(false);
        axios.delete('/api/users/delete/'+userId)
        .then((response) => {
         console.log("response ",response);
            swal({
            text: "User Deleted Successfully."
            });
            getDeletedUserList();
        })
        .catch((err)=>console.log("err",err))
    }

    const restoreUser=()=>{
        setRestoreModal(false);
        axios.patch('/api/users/patch/restorestatus',{user_id_toberecover:userId})
        .then((response) => {
         console.log("response",response);
            swal({
                text: "User Restored Successfully."
            });
            getDeletedUserList();
            props.getUserList();
        })
        .catch((err)=>console.log("err",err))
    }


  return (
    <div className="w-full  ">
        <Card className="h-full w-full overflow-scroll">
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
                {
                    userList && userList.length>0?
                    userList.map(({ _id,name, email, mobile,role,status }, index) => {
                    const isLast = index === userList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                    console.log("userList1",userList)
                    return (
                        <tr key={index}>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {name}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {email}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {mobile}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {role}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className={status === "active" ?"bg-green-400 font-normal flex justify-center text-white": "bg-danger-400  font-normal item-center"}
                            >
                            {status}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <div className='flex gap-6'>
                                <Button className="bg-site" onClick={()=>{setRestoreModal(true);setUserId(_id)}}>Restore User</Button>
                                <Button className="bg-red-500" onClick={()=>{setDeleteModal(true);setUserId(_id)}} >Delete User</Button>
                            </div>
                        {/* <Tooltip content="">
                          <IconButton variant="text"  onClick={()=>{setDeleteModal(true);setDeleteUserId(_id)}}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip> */}
                        </td>
                        </tr>
                        
          
                        
                    );
                    
                    })
                    :
                    <tr >
                        <td colSpan={6} >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-center p-2"
                            >
                            NO DELETED USERS FOUND
                            </Typography>
                        </td>
                        </tr>
                }
                </tbody>
                </table>
            </Card>
            <Modal show={deleteModal} size="md" onClose={() => setDeleteModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete permananetly this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteUser()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={restoreModal} size="md" onClose={() => setRestoreModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to restore this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => restoreUser()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setRestoreModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>

        
      </Modal>

    </div>
  );
}

export default DeletedUsers;
