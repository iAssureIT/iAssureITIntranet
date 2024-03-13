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
    const [user,setUser]=useState();
    const [roleList,setRoleList] = useState([]);
    const [departmentList,setDepartmentList] = useState([]);
    const [designationList,setDesignationList] = useState([]);
    const [managerList,setManagerList] = useState([]);
    const [first_name,setFirstName]= useState('');
    const [last_name,setLastName]= useState('');
    const [phone,setPhone]= useState('');
    const [email,setEmail]= useState('');
    const [role,setRoll]= useState('');
    const [department,setDepartment]= useState('');
    const [designation,setDesignation]= useState('');
    const [reporting_manager,setReportingManager]= useState('');
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
      } = useForm()

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        setUser(user);
        getRoleList();
        getDepartmentList();
        getManagerList();
        if(props.editUserId){
            getOneUser(props.editUserId)
        }
      },[1]);

      const getOneUser =(user_id)=>[
        axios.get('/api/users/get/'+user_id)
        .then(res=>{
            console.log("res",res);
            setFirstName(res.data.firstname);
            setLastName(res.data.lastname);
            setPhone(res.data.mobile);
            setEmail(res.data.email);
        })
        .catch(err=>{
            console.log("err",err);
        })
      ]


      const getManagerList =()=>[
        axios.get('/api/users/get/managerlist/manager')
        .then(res=>{
            console.log("res",res);
            var userList = [];
            for (let index = 0; index < res.data.data.length; index++) {
                let userData ={
                    _id  : res.data.data[index]._id,                
                    name : res.data.data[index]?.profile?.fullName,
                    username : res.data.data[index]?.username
                } 
                userList.push(userData);
            }
            setManagerList(userList);
        })
        .catch(err=>{
            console.log("err",err);
        })
      ]


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

    const getDepartmentList =()=>{
        axios.post('/api/department/get/list')
        .then((response) => {
         console.log("response role",response);
         var departmentList = [];
         for (let index = 0; index < response.data.length; index++) {
             let data ={
                department_id : response.data[index]._id,
                department:response.data[index].department
             } 
             departmentList.push(data);
         }
         setDepartmentList(departmentList)
         console.log("roleList",roleList);
        })
        .catch((err)=>console.log("err",err))
    }

    const getDesignationList =(value)=>{
        console.log("value==>",value);
        axios.post('/api/designation/get/list/',{department:value})
        .then((response) => {
         console.log("response role",response);
         var designationList = [];
         for (let index = 0; index < response.data.length; index++) {
             let data ={
                designation_id : response.data[index]._id,
                designation:response.data[index].designation,
                orgLevel:response.data[index].orgLevel,
                department:response.data[index].department
             } 
             designationList.push(data);
         }
         setDesignationList(designationList)
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
            "pwd": "iAssureIT@123",
            "department" :data.department,
            "designation" :data.designation.split("-")[0],
            "orgLevel" : data.designation.split("-")[1],
            "role" :  [data.role],
            "companyID": 1,
            "status": "active",
            "createdBy":user.user_id
          }
          console.log("user",user);
        axios.post('/api/auth/post/signup/user',formValues)
        .then((res) => {
            console.log("res",res);
            formValues.userId = res.data.ID;
            console.log("formValues",formValues);
            addEmployee(formValues);
            swal({
                text: res.data.message
            });
            props.getUserList();
        })
        .catch((err)=>console.log("err",err))
    }   

    const addEmployee=(data)=>{
        axios.post('/api/personmaster/post',data)
        .then((res) => {
            reset();
            console.log("res",res);
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
                            <input type="text" id="first_name" {...register("first_name",{required:true})} value={first_name} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Firstname..." required />
                        </div>
                        <div>
                            <label for="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name</label>
                            <input type="text" id="last_name" {...register("last_name",{required:true})} value={last_name}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Lastname..." required />
                        </div>
                        <div>
                            <label for="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone number</label>
                            <input type="tel" id="phone" {...register("phone",{required:true})} value={phone}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Mobile number..." pattern="/^+91(7\d|8\d|9\d)\d{9}$/" required />
                        </div>
                        <div >
                            <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email address</label>
                            <input type="email" id="email" {...register("email",{required:true})} value={email} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Email..." required />
                        </div> 
                        <div >
                            <label for="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Role</label>
                            <select id="role" {...register("role",{required:true})} value={role}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
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
                        <div >
                            <label for="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Department</label>
                            <select id="department" {...register("department",{required:true})} value={department} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e)=>{getDesignationList(e.target.value)}}>
                                <option selected>Select Department</option>
                                {departmentList &&
                                    departmentList.map((item,index)=>{
                                        return(
                                            <option value={item.department}>{item.department}</option>
                                        )
                                    })
                                }
                            </select>
                        </div> 
                        <div >
                            <label for="designation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Designation</label>
                            <select id="designation" {...register("designation",{required:true})} value={designation} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected>Select Designation</option>
                                {designationList &&
                                    designationList.map((item,index)=>{
                                        return(
                                            <option value={item.designation+"-"+item.orgLevel}>{item.designation}</option>
                                        )
                                    })
                                }
                            </select>
                        </div> 
                        <div >
                            <label for="reporting_manager" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Reporting Manager</label>
                            <select id="reporting_manager" {...register("reporting_manager",{required:true})} value={reporting_manager}   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option  selected>Select Reporting Manager</option>
                                    {managerList  && managerList.length> 0 &&
                                    managerList.map((item,index)=>{
                                        return(
                                            <option value={item?.username+" "+item?._id}>{item?.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div> 
                    </div>
                   
                    <button type="submit" className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{props.edit? "Update":"Submit"}</button>
                </form>
        </div>
        </div>

    </div>
  );
}

export default AddEmployee;
