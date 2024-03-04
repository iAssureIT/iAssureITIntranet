import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment, faCross, faXmark} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import 'flowbite/dist/flowbite.js'
import AddRole from './AddRole';
import AddEmployee from './AddEmployee';
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import swal from 'sweetalert';
import DeletedUsers from './DeletedUsers';
const TABLE_HEAD = ["Name", "Email", "Mobile Number","Role","Status","Last Logged In", "Action"];

function UserManagement() {
    const [open,setOpen] = useState(true);
    const [userList,setUserList] = useState([]);
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [deleteModal,setDeleteModal]=useState(false) ;
    const [deleteUserModal,setDeleteUserModal]=useState(false) ;
    const [deleteUserId,setDeleteUserId]=useState('');
    const [editUserId,setEditUserId] = useState('');

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        // setUser(user);
        getUserList()
      },[1]);

      const getUserList=()=>{
        var formValues ={
            startRange : 0,
            limitRange: 50,
            companyID  : 1
        }
       axios.post('/api/users/post/list',formValues)
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

      const editUser=(data)=>{
        // console.log("department",data);
        // setUpdate(true);
        setEditUserId()
        // setdepartment(data.department) ;
        // setdepartmentId(data.department_id)
    }

    const deleteUser=()=>{
        setDeleteModal();
        console.log("deleteUserId",deleteUserId);
        var formValues={
          user_id_tobedeleted : deleteUserId
        }
        axios.patch('/api/users/patch/deletestatus',formValues)
        .then((response) => {
         console.log("response department",response);
            swal({
            text: "User Deleted Successfully."
            });
            getUserList();
        })
        .catch((err)=>console.log("err",err))
    }
      
  return (
    <>
    <div className="w-full App ">
        <div className='p-7 text-xl font-semibold  h-screen'>
            <div className='flex justify-between'>
                <span className='text-left'>USER MANAGEMENT</span>
                <Button className="bg-red-500" onClick={() => setDeleteUserModal(true)}>Deleted Users</Button>

            </div>
            <div className='flex justify-between mt-8'>
                <Button className="bg-site" onClick={() => setOpenRoleModal(true)}>Add Role</Button>
                <Button className="bg-site" onClick={() => setOpenUserModal(true)}>Add User</Button>
            </div>
            {/* <AddRole /> */}
            {/* <AddEmployee getUserList={getUserList}/> */}

           
            <Card className="h-full w-full overflow-scroll mt-16">
                <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                    {TABLE_HEAD.map((head) => (
                        <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-site p-4"
                        >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none text-white"
                        >
                            {head}
                        </Typography>
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {userList.map(({ _id,name, email, mobile,role,status,lastloggedin }, index) => {
                    const isLast = index === userList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={name}>
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
                            className={status === "active" ?"bg-green-400 font-normal flex justify-center text-white": "bg-danger-400 text-white font-normal item-center"}
                            >
                            {status}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {lastloggedin? lastloggedin:"Not Logged In"}
                            </Typography>
                        </td>
                        <td className={classes}>
                          <Tooltip content="" >
                          <IconButton variant="text" onClick={()=>editUser(setEditUserId(_id))}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="">
                          <IconButton variant="text"  onClick={()=>{setDeleteModal(true);setDeleteUserId(_id)}}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </Card> 

        </div>
        
    </div>

      <Modal show={openRoleModal} onClose={() => setOpenRoleModal(false)}>
        <Modal.Header>Add Role</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <AddRole/>            
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={deleteUserModal}  size="7xl" onClose={() => setDeleteUserModal(false)}>
        <Modal.Header>Deleted Users</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <DeletedUsers getUserList={getUserList} />            
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={openUserModal} onClose={() => setOpenUserModal(false)}>
        <Modal.Header>Add Employee</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <AddEmployee getUserList={getUserList} />            
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={deleteModal} size="md" onClose={() => setDeleteModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
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

    </>
  );
}

export default UserManagement;
