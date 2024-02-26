import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment, faCross, faXmark} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card,Typography } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import 'flowbite/dist/flowbite.js'
import AddRole from './AddRole';
import AddEmployee from './AddEmployee';
import { Button, Modal } from 'flowbite-react';



const TABLE_HEAD = ["Name", "Email", "Mobile Number","Role","Last Logged In", "Action"];

function UserManagement() {
    const [open,setOpen] = useState(true);
    const [userList,setUserList] = useState([]);
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [openUserModal, setOpenUserModal] = useState(false);

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
                name : response.data[index].fullName,
                email:response.data[index].email,
                mobile:response.data[index].mobNumber,
                role:response.data[index].role,
                lastloggedin:response.data[index].lastLogin
            } 
            userList.push(userData);
        }
        setUserList(userList)
        console.log("userList",userList);
       })
       .catch((err)=>console.log("err",err))
      }
      
  return (
    <>
    <div className="w-full App ">
        <div className='p-7 text-xl font-semibold  h-screen'>
            <div className='grid  grid-cols bg-grey-200 mb-8'>
                <span className='text-left'>USER MANAGEMENT</span>
            </div>
            <div className='flex justify-between'>
                <Button className="bg-site" onClick={() => setOpenRoleModal(true)}>Add Role</Button>
                <Button className="bg-site" onClick={() => setOpenUserModal(true)}>Add User</Button>
            </div>
            {/* <AddRole /> */}
            {/* <AddEmployee getUserList={getUserList}/> */}

           
            <Card className="h-full w-full overflow-scroll mt-4">
                <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                    {TABLE_HEAD.map((head) => (
                        <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                        >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            {head}
                        </Typography>
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {userList.map(({ name, email, mobile,role,lastloggedin }, index) => {
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
                            className="font-normal"
                            >
                            {lastloggedin}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            as="a"
                            href="#"
                            variant="small"
                            color="blue-gray"
                            className="font-medium"
                            >
                            Edit
                            </Typography>
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
        {/* <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>I accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Decline
          </Button>
        </Modal.Footer> */}
      </Modal>
      <Modal show={openUserModal} onClose={() => setOpenUserModal(false)}>
        <Modal.Header>Add Employee</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
                <AddEmployee/>            
          </div>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>I accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Decline
          </Button>
        </Modal.Footer> */}
      </Modal>

    </>
  );
}

export default UserManagement;
