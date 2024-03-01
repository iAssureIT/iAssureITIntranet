import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card } from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
function AddPolicy(props) {
    console.log("props",props);
    const {policy,getPolicyList,edit,openModal}=props;
    const [open,setOpen] = useState(true);
    const [user,setUser]=useState();
    const [roleList,setRoleList] = useState([]);
    const [designationList,setDesignationList] = useState([]);
    const [policy_name,setPolicyName] = useState('');
    const [policy_category,setPolicyCategory] = useState('');
    const [policy_summary,setPolicySummary] = useState('');
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        setUser(user);
        setPolicyName(policy?.policy_name?policy?.policy_name:'');
        setPolicyCategory(policy?.policy_category?policy?.policy_category:'');
        setPolicySummary(policy?.policy_summary?policy?.policy_summary:'');
      },[props]);

    


    const onSubmit = (data) => {
        const formValues = {
            "policy_name"       : data.policy_name,
            "policy_category"    : data.policy_category,
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

    

    return (
    <div className="w-full  ">
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            {/* <span className='text-left'>Add Employee</span> */}
                <form  onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 mb-6 md:grid-cols-1">
                        <div>
                            <label for="policy_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Policy name</label>
                            <input type="text" id="policy_name"  {...register("policy_name",{required:true})}value={policy_name} onChange={(e)=>setPolicyName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Policy Name..."  />
                        </div>
                        <div >
                            <label for="policy_category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
                            <select id="policy_category" {...register("policy_category",{required:true})} value={policy_category} onChange={(e)=>setPolicyCategory(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option disabled selected>Select Category</option>
                                    <option value="Leave policy">Leave Policy</option>
                                    <option value="Payroll policy">Payroll Policy</option>
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

export default AddPolicy;
