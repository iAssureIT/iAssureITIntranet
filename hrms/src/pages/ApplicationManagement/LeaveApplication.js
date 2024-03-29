import { useState,useEffect } from 'react';
import { Card } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Datepicker from "react-tailwindcss-datepicker"; 

function LeaveApplication(props) {
    console.log("props",props);
    const {policy,getPolicyList,edit,onClose}=props;
    const [open,setOpen] = useState(true);
    const [user,setUser]=useState();
    const [roleList,setRoleList] = useState([]);
    const [designationList,setDesignationList] = useState([]);
    const [policy_summary,setPolicySummary] = useState('');
    const [managerList,setManagerList] = useState([]);
    const [value, setValue] = useState({ 
        startDate: new Date(), 
        endDate: new Date().setMonth(11) 
        }); 
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("user",user);
        setUser(user);
        getManagerList();
      },[props]);

      const getManagerList =()=>[
        axios.get('/api/users/get/managerlist/manager')
        .then(res=>{
            console.log("res",res);
            var userList = [];
            for (let index = 0; index < res.data.data.length; index++) {
                let userData ={
                    _id  : res.data.data[index]._id,                
                    name : res.data.data[index]?.profile?.fullName,
                    username : res.data.data[index]?.username,

                } 
                userList.push(userData);
            }
            setManagerList(userList);
        })
        .catch(err=>{
            console.log("err",err);
        })
      ]

    const onSubmit = (data) => {
        console.log("data",data);
        console.log("policy_summary",policy_summary);
        const formValues1 = {
            toEmail: data.reporting_manager.split(' ')[0],
            // toEmail: 'rushi.salunkhe101@gmail.com',
            subject: data.leave_subject,
            text: data.leave_type,
            mail:policy_summary,


          };
          console.log("notification", formValues1);
        //   axios
        //     .post("/send-email", formValues1)
        //     .then((res) => {
        //       console.log("res 117", res);
        //       if (res.status === 200) {
                const formValues = {
                    manager_name: data.reporting_manager.split(' ')[0],
                    manager_id: data.reporting_manager.split(' ')[1],
                    leaveSubject: data.leave_subject,
                    leaveType: data.leave_type,
                    leaveSummary:policy_summary,
                    user_id : user.user_id,
                    user_name : user.firstName+" "+user.lastName,
                    fromDate: new Date(value.startDate),
                    toDate : new Date(value.endDate)
                  };
                  console.log("formValues",formValues);
                    axios.post('/api/leaveApplication/post',formValues)
                    .then(res=>{
                        console.log("res",res);
                        onClose();
                        swal({
                            text: res.data.message
                        });

                    })  
                    .catch(err=>{
                        console.log("err",err);
                    })
            //   }
            // })
            // .catch((error) => {
            //   console.log("error = ", error);
            // });
    }   

    console.log("managerList",managerList);

  
        
        const handleValueChange = (newValue) => {
        console.log("newValue:", newValue); 
        setValue(newValue); 
        } 

    return (
    <div className="w-full  ">
      <div className='p-7  font-semibold'>
        <div className='grid  grid-cols bg-grey-200 '>
            {/* <span className='text-left'>Add Employee</span> */}
                <form  onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 mb-6 md:grid-cols-1">
                    <div >
                            <div className='text-l'>Employee Name : <span  className='text-l'   >{user?.firstName+ " "+user?.lastName}</span></div>
                        </div> 
                    <div >
                            <label for="reporting_manager" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Reporting Manager</label>
                            <select id="reporting_manager" {...register("reporting_manager",{required:true})}   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option disabled selected>Select Reporting Manager</option>
                                    {managerList  && managerList.length> 0 &&
                                    managerList.map((item,index)=>{
                                        return(
                                            <option value={item?.username+" "+item?._id}>{item?.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div> 
                        <div>
                            <label for="leave_subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Leave Subject</label>
                            <input type="text" id="leave_subject" {...register("leave_subject",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Subject..." required />
                        </div>
                        <div >
                            <label for="leave_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Leave Type</label>
                            <select id="leave_type" {...register("leave_type",{required:true})}   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option disabled selected>Select Leave Type</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Payroll policy">Maternity Leave</option>
                                    <option value="Payroll policy">Paternity Leave</option>
                                    <option value="Payroll policy">Paternity Leave</option>
                            </select>
                        </div> 

                        <Datepicker 
                            value={value} 
                            onChange={handleValueChange} 
                            useRange={false}
                            minDate={new Date()} 
                        /> 

                        <CKEditor
                                editor={ ClassicEditor }
                                data={policy_summary}
                                // id="policy_summary" 
                                // {...register("policy_summary",{required:true})}
                                onReady={ editor => {
                                    // You can store the "editor" and use when it is needed.
                                    console.log( 'Editor is ready to use!', editor );
                                } }
                                onChange={ ( event,editor ) => {
                                    setPolicySummary(editor.getData())
                                } }
                                onBlur={ ( event, editor ) => {
                                    console.log( 'Blur.', editor );
                                } }
                                onFocus={ ( event, editor ) => {
                                    console.log( 'Focus.', editor );
                                } }
                            />
                    </div>
                   
                    <button type="submit" className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                </form>
        </div>
        </div>

    </div>
  );
}

export default LeaveApplication;