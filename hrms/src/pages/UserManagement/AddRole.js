import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";


const TABLE_HEAD = ["Role",  "Action"];

function AddRole() {
    const [open,setOpen] = useState(true);
    const [roleList,setRoleList] = useState([]);
    const [update,setUpdate] = useState(false);
    const [role,setRole] = useState('');
    const [role_id,setRoleId] = useState('');
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getRoleList()
      },[1]);

      const onSubmit = (data) => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        
          if(update){
            var formValues = {
                fieldValue: data.role.toString().toLowerCase(),
                fieldID :role_id,
                updatedBy : user.user_id,
              }
            axios.patch('/api/roles/patch', formValues)
          .then((response) => {
                console.log("response",response);
                  if(response.updated){
                    swal({
                        text: "Role Updated Successfully."
                    });
                }else{
                    swal({
                        text: "Role Already Added."
                    });
                }
                setUpdate(false);
                setRoleId('');
                getRoleList();
                setRole('');
  
          })
          .catch((error) => {
            console.log("error", error);
          
          });
        }
       else{
        var formValues = {
            fieldValue: data.role.toString().toLowerCase(),
            user_id: user.user_id,
          }
        axios.post('/api/roles/post', formValues)
            .then((response) => {
                console.log("response",response);
                if(response.data.created){
                    swal({
                        text: "Role Added Successfully."
                    });
                }else{
                    swal({
                        text: "Role Already Added."
                    });
                }
                getRoleList();
                setRole('');
            })
            .catch((error) => {
            console.log("error", error);
            
            });
        }
        
    };

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

    const editUser=(data)=>{
        console.log("role",data);
        setUpdate(true);
        setRole(data.role) ;
        setRoleId(data.role_id)
    }

    const deleteUser=(data)=>{
        console.log("role",data);
        axios.delete('/api/roles/delete/'+data.role_id)
        .then((response) => {
         console.log("response role",response);
            swal({
            text: "Role Deleted Successfully."
            });
            getRoleList();
        })
        .catch((err)=>console.log("err",err))
    }

  return (
    <div className="w-full  ">
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <form className='flex grid-cols'  onSubmit={handleSubmit(onSubmit)}>
                <div class="grid mb-6 md:grid-cols-2">
                        <input type="text" id="role"{...register("role",{required:true})} value={role} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Role..." required onChange={(e)=>setRole(e.value)} />
               </div>
               <div class="grid mb-6 md:grid-cols-2">
                    <button type="submit" className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{update?"Update":"Submit"}</button>
                 </div>
            </form>
        </div>
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
                    {roleList.map(({ role }, index) => {
                    const isLast = index === roleList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={role}>
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
                      <Tooltip content="Edit User" >
                        <IconButton variant="text" onClick={()=>editUser(roleList[index])}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete User">
                        <IconButton variant="text"  onClick={()=>deleteUser(roleList[index])}>
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
  );
}

export default AddRole;
