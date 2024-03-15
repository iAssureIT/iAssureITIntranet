import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment, faCross, faXmark} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import 'flowbite/dist/flowbite.js'
import AddRole from './AddRole';
import AddEmployee from './AddEmployee';
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton,Checkbox} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import swal from 'sweetalert';
import DeletedUsers from './DeletedUsers';
import { useForm } from 'react-hook-form';

function UserManagement() {
    const [open,setOpen] = useState(true);
    const [userList,setUserList] = useState([]);
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [deleteModal,setDeleteModal]=useState(false) ;
    const [deleteUserModal,setDeleteUserModal]=useState(false) ;
    const [deleteUserId,setDeleteUserId]=useState('');
    const [editUserId,setEditUserId] = useState('');
    const [edit,setEdit]=useState(false);
    const [checked,setMultiChecked]=useState(false);
    const [action,setAction]=useState('')
    const [user_ids,setUserIds]=useState([]);
    const [roleList,setRoleList]=useState([]);
    const TABLE_HEAD = [ <Checkbox color="blue"checked={checked} onClick={(e)=>selectAllUsers(e)} />,"Name", "Email", "Mobile Number","Role","Status","Last Logged In", "Action"];


    const {
      register,
      handleSubmit,
      watch,
      setError,
      clearErrors,
      reset,
      formState: { errors ,isValid},
    } = useForm()

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        // setUser(user);
        getUserList();
        getRoleList();
      },[]);

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
        for (var index = 0; index < response.data.length; index++) {
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

      const editUser=(_id)=>{
        setEdit(true);
        setEditUserId(_id);
        setOpenUserModal(true);
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

    function addUserIds(event,_id){
      console.log("e",event.target.checked)
      let userIds = [...user_ids];
      if(event.target.checked){
        userIds = [...userIds,_id]
      }else{
        const index = userIds.indexOf(_id);
        if (index > -1) { // only splice array when item is found
          userIds.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
      setUserIds(userIds);
    }

    const selectAllUsers=(event)=>{
      setMultiChecked(!checked);
      if(event.target.checked){
        let userIds = userList.map((a)=>a._id);
        setUserIds(userIds);
      }else{
        setUserIds([]);
      }
    }

    const getRoleList =()=>{
      axios.post('/api/roles/get/list')
      .then((response) => {
       console.log("response role",response);
       var roleList = [];
       for (let index = 0; index < response.data.length; index++) {
           let roleData ={
              role_id : response.data[index]._id,
              role:response.data[index].role
           } 
           roleList.push(roleData);
       }
       setRoleList(roleList)
       console.log("roleList",roleList);
      })
      .catch((err)=>console.log("err",err))
  }

  const performAction=(e)=>{
    console.log("e=>",e);   
    var action=e.split("-")[0];
    if(action === "status"){
      const formValues ={
        userID :user_ids,
        status :e.split("-")[1],
        username:''
      }
      console.log("formValues",formValues);
      axios.patch('/api/users/patch/status',formValues)
      .then(res=>{
        console.log("res",res)
        swal({
          text:res.data === "USER_STATUS_NOT_UPDATED" ? "Please select atleast one user" : res.data
          });
          getUserList();
          setMultiChecked(false);
          setUserIds([])
      })
      .catch(err=>{
        console.log("err",err);
      })
    }else {
      const formValues ={
        userID :user_ids,
        // status :e,
        username:'',
        role:e.split("-")[1],
        action : action
      }
      axios.patch('/api/users/patch/role',formValues)
      .then(res=>{
        console.log("res",res)
        swal({
          text:res.data === "USER_STATUS_NOT_UPDATED" ? "Please select atleast one user" : res.data
          });
          getUserList();
          setMultiChecked(false);
          setUserIds([])
      })
      .catch(err=>{
        console.log("err",err);
      })
    }
  }

  const searchUser =(e)=>{
    const formValues ={
      searchText : e,
      startRange:0,
      limitRange:100
    }
  console.log("formValues",formValues);
  axios.post('/api/users/get/searchlist',formValues)
      .then(response=>{
        var userList = [];
        for (var index = 0; index < response.data.length; index++) {
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
      })
      .catch(err=>{
        console.log("err",err);
      })
  }

 

  console.log("userIds",user_ids);
      
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
                <Button className="bg-site" onClick={() => {setOpenUserModal(true);setEdit(false)}}>Add User</Button>
            </div>
            <div className='grid gap-6 md:grid-cols-3 mt-6 flex justify-between'>
            <div >
                  {/* <label for="action" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Action<span className="text-red-500">*</span></label> */}
                  <select id="action" value={action} {...register("action",{required:false})} onChange={(e)=>performAction(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" >
                  <option value="" disabled selected>Select Action</option>
                    <optgroup label="Active / Block" >
                      <option value="status-block">Add block role to selected</option>
                      <option value="status-active">Add active role to selected</option> 
                    </optgroup>   
                    <optgroup label="Add Roles" >
                      {roleList.map((item,index)=>{
                      return(
                         <option value={"add-"+item.role}>Add {item.role} role to selected</option>
                      )
                      })}
                    </optgroup> 
                    <optgroup label="Remove Roles" >
                    {roleList.map((item,index)=>{
                      return(
                         <option value={"remove-"+item.role}>Remove {item.role} role from selected</option>
                      )
                      })}
                    </optgroup> 
                  </select>
              </div>  
              <form className="">   
              {/* <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label> */}
              <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                  </div>
                  <input type="search" id="default-search" onChange={(e)=>searchUser(e.target.value)} className="h-11 block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search By Name, Email, and Mobile Number..." required />
              </div>
          </form>
            
            </div>
           

            {/* <AddRole /> */}
            {/* <AddEmployee getUserList={getUserList}/> */}

           
            <Card className="h-full w-full overflow-scroll mt-6">
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
                    {userList && userList.length > 0 &&
                    userList.map(({ _id,name, email, mobile,role,status,lastloggedin }, index) => {
                      console.log("inside render");
                    const isLast = index === userList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={index}>
                           <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            <Checkbox color="blue" checked={user_ids.indexOf(_id) >-1 ? true:false} onClick={(e)=>addUserIds(e,_id)} />
                            </Typography>
                        </td>
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
                            {/* {
                              role.map((a)=>{
                                return a+", "
                              }
                            )} */}
                            {role.join(', ').replace(/, ([^,]*)$/, ', $1')}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className={status === "active" ?"bg-green-400 font-normal flex justify-center text-white": "bg-red-400 text-white font-normal flex justify-center"}
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
                          <IconButton variant="text" onClick={()=>{editUser(_id)}}>
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
        <Modal.Header>{edit?"Edit":"Add"} Employee</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <AddEmployee getUserList={getUserList} edit={edit} editUserId={editUserId} />            
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
