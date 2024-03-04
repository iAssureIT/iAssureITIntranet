import { useState,useEffect } from 'react';
import { Card } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function LeaveApplication(props) {
    console.log("props",props);
    const {policy,getPolicyList,edit,openModal}=props;
    const [open,setOpen] = useState(true);
    const [user,setUser]=useState();
    const [roleList,setRoleList] = useState([]);
    const [designationList,setDesignationList] = useState([]);
    const [policy_summary,setPolicySummary] = useState('');
    const [managerList,setManagerList] = useState([]);
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
        const formValues = {
            "leave_type"        : data.leave_type,
            "leave_type"        : data.leave_type,
            "policy_summary"    : policy_summary,
            "createdBy"         : user.user_id
        }
        if(edit){
            formValues.policy_id=policy._id;
            axios.patch('/api/policy/update-policy',formValues)
            .then((res) => {
                console.log("res",res);
                console.log("formValues",formValues);
                swal({
                    text: res.data.message
                });
               getPolicyList();
               openModal(false);
            })
            .catch((err)=>console.log("err",err))
        }else{
            axios.post('/api/policy/insert-policy',formValues)
            .then((res) => {
                console.log("res",res);
                console.log("formValues",formValues);
                swal({
                    text: res.data.message
                });
               getPolicyList();
               openModal(false);
            })
            .catch((err)=>console.log("err",err))
        }
    }   

    console.log("managerList",managerList);

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
                            <label for="leave_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Reporting Manager</label>
                            <select id="leave_type" {...register("leave_type",{required:true})}   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option disabled selected>Select Reporting Manager</option>
                                    {managerList  && managerList.length> 0 &&
                                    managerList.map((item,index)=>{
                                        return(
                                            <option value={item?._id}>{item?.name}</option>
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