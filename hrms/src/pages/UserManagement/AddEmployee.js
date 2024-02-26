import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
function AddEmployee(props) {
    console.log("props",props);
    const [open,setOpen] = useState(true);
    const [roleList,setRoleList] = useState([]);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

    useEffect(() => {
        getRoleList()
      },[1]);

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

    const onSubmit = (data) => {
        console.log("data",data);
        const formValues = {
            "firstname": data.first_name,
            "lastname": data.last_name,
            "email": data.email,
            "username":"EMAIL",
            "userName":data.email,
            "mobNumber": (data.phone).replace("-", ""),
            "pwd": "Welcome@123",
            // "role": data.role !== "employee" ? ["  employee",data.role] : ["employee"],
            "role" :  [data.role],
            "companyID": 1,
            "status": "active",
          }
        axios.post('/api/auth/post/signup/user',formValues)
        .then((res) => {
            swal({
                text: res.data.message
            });
            props.getUserList();
        })
        .catch((err)=>console.log("err",err))
    }   
    return (
    <div className="w-full  ">
      
     
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            {/* <span className='text-left'>Add Employee</span> */}
                <form  onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            <label for="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First name</label>
                            <input type="text" id="first_name" {...register("first_name",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Firstname..." required />
                        </div>
                        <div>
                            <label for="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name</label>
                            <input type="text" id="last_name" {...register("last_name",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Lastname..." required />
                        </div>
                        <div>
                            <label for="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone number</label>
                            <input type="tel" id="phone" {...register("phone",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Mobile number..." pattern="/^+91(7\d|8\d|9\d)\d{9}$/" required />
                        </div>
                        <div >
                            <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email address</label>
                            <input type="email" id="email" {...register("email",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Email..." required />
                        </div> 
                        <div >
                            <label for="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
                            <select id="role" {...register("role",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected>Select Role</option>
                                {roleList &&
                                    roleList.map((item,index)=>{
                                        return(
                                            <option value={item.role}>{item.role}</option>
                                        )
                                    })
                                }
                            </select>
                        </div> 
                        <div className="mb-6">
                             <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input type="password" {...register("password",{required:true})} id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Password..." required />
                        </div> 
                    </div>
                   
                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                </form>
        </div>
        </div>

    </div>
  );
}

export default AddEmployee;