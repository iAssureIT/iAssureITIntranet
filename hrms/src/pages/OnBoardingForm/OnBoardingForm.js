import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faBell,faSignOut} from '@fortawesome/free-solid-svg-icons';
import { useState,useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip  } from 'react-tooltip';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { useForm } from 'react-hook-form';
// import Joi from 'joi';


function OnBoardingForm(){
const navigate = useNavigate();
const [user,setUser]=useState();
const [open,setOpen] = useState(true);

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
  console.log("user",user);
},[1]);

// const schema = Joi.object({
//     first_name: Joi.string().required(),
//     last_name: Joi.string().required(),
//     current_address: Joi.string().required(),
//     city: Joi.string().required(),
//     state: Joi.string().required(),
//     personal_email: Joi.string().email().required(),
//     personal_mobile: Joi.string().pattern(/^+91(7\d|8\d|9\d)\d{9}$/).required(),
//     alternate_no: Joi.string().pattern(/^+91(7\d|8\d|9\d)\d{9}$/).required(),
//     dob: Joi.date().required(),
//     doa: Joi.date(),
//     aadhar_card_no: Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/).required(),
//     pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/).required(),
//     passport_no: Joi.string().pattern(/^[A-Z0-9]{7,}$/).required(),
//     blood_group: Joi.string().required()
// });

    

    const onSubmit = (data) => {
        console.log("data here ====",data);
        const formValues = {
            "firstname": data.first_name,
            "lastname": data.last_name,
            "email": data.current_address, 
            "city": data.city, 
            "state": data.state, 
            "personalEmail" : data.personal_email, 
            "personalMobileNo": data.personal_mobile, 
            "alternateMobileNo": data.alternate_no, 
            "dob": data.dob, 
            "dateOfAnniversary": data.doa,
            "aadharCardNo": (data.aadhar_card_no).replace("-", ""),
            "panCardNo": data.pan_card_no, 
            "passportNo": data.passport_no, 
            "bloodGroup": data.blood_group,
          }
        console.log("here formvalues ==", formValues)
        // api- data should be update and status should change from pending to Unverified
        // axios.post('/api/auth/post/signup/user',formValues)
        // .then((res) => {
        //     swal({
        //         text: res.data.message
        //     });
        //     props.getUserList();
        //     navigate to another screen where user able to filled info with unverified status
        // })
        // .catch((err)=>console.log("err",err)) // on error show error msg and form should be reset
    }   

  return(
    <>
        
    <div className="w-full">
      <div className='p-7 text-xl font-semibold'>
      <div className='text-center'>Fill below details</div>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <span className='text-left'> Employee Details :</span>
                <form  onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 my-6 md:grid-cols-2 p-4 bg-blue-200 rounded">
                        <div>
                            <label for="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name<span className="text-red-500">*</span></label>
                            <input type="text" id="first_name" {...register("first_name",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Firstname" />
                            {errors.first_name && <span className="text-sm font-medium text-red-500">First Name is required</span>}
                        </div>
                        <div>
                            <label for="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name<span className="text-red-500">*</span></label>
                            <input type="text" id="last_name" {...register("last_name",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Lastname" />
                            {errors.last_name && <span className="text-sm font-medium text-red-500">Last Name is required</span>}
                        </div>
                        <div>
                            <label for="current_address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Address<span className="text-red-500">*</span></label>
                            <textarea type="text" id="current_address" {...register("current_address",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"> </textarea>
                            {errors.current_address && <span className="text-sm font-medium text-red-500">Current Address is required</span>}
                        </div>
                        <div>
                            <label for="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City<span className="text-red-500">*</span></label>
                            <input type="text" id="city" {...register("city",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter City" />
                            {errors.city && <span className="text-sm font-medium text-red-500">City is required</span>}
                        </div>
                        <div>
                            <label for="state" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">State<span className="text-red-500">*</span></label>
                            <input type="text" id="state" {...register("state",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter State" />
                            {errors.state && <span className="text-sm font-medium text-red-500">State is required</span>}
                        </div>
                        {/* <div>
                            <label for="pincode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode</label>
                            <input type="text" id="pincode" {...register("pincode",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Pincode" />
                        </div> */}
                        <div>
                            <label for="personal_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Email<span className="text-red-500">*</span></label>
                            <input type="email" id="personal_email" {...register("personal_email",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Personal Email" />
                            {errors.personal_email && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                        <div>
                            <label for="personal_mobile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Mobile<span className="text-red-500">*</span></label>
                            <input type="tel" id="personal_mobile" {...register("personal_mobile",{required:true, pattern: /^\+?\d{10}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Mobile Number" pattern="/^+91(7\d|8\d|9\d)\d{9}$/" />
                            {errors.personal_mobile && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                        <div>
                            <label for="alternate_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alternate Number<span className="text-red-500">*</span></label>
                            <input type="tel" id="alternate_no" {...register("alternate_no",{required:true, pattern: /^\+?\d{10}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Alternate Mobile Number" pattern="/^+91(7\d|8\d|9\d)\d{9}$/" />
                            {errors.alternate_no && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                        <div >
                            <label for="dob" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date Of Birth<span className="text-red-500">*</span></label>
                            <input type="date" id="dob" {...register("dob",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>}
                        </div> 
                        <div >
                            <label for="doa" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date of Anniversary (If Married)</label>
                            <input type="date" id="doa" {...register("doa")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  />
                            
                        </div> 
                        <div >
                            <label for="aadhar_card_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Aadhar Card Number<span className="text-red-500">*</span></label>
                            <input type="text" id="aadhar_card_no" {...register("aadhar_card_no",{required:true, pattern: /^\d{4}-\d{4}-\d{4}$/ })} maxLength={14} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.aadhar_card_no && <span className="text-sm font-medium text-red-500">Please enter a valid Aadhar Card Number (XXXX-XXXX-XXXX)</span>}
                        </div> 
                        <div >
                            <label for="pan_card_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PAN Card Number<span className="text-red-500">*</span></label>
                            <input type="text" id="pan_card_no" {...register("pan_card_no",{required:true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/ })} maxLength={10} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.pan_card_no && <span className="text-sm font-medium text-red-500">Please enter a valid PAN Card Number (ABCDE1234F)</span>}
                        </div> 
                        <div >
                            <label for="passport_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Passport Number<span className="text-red-500">*</span></label>
                            <input type="text" id="passport_no" {...register("passport_no",{required:true, pattern: /^[A-Z0-9]{7,}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.passport_no && <span className="text-sm font-medium text-red-500">Please enter a valid Passport Number</span>}
                        </div> 
                        <div >
                            <label for="blood_group" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Blood Group<span className="text-red-500">*</span></label>
                            <select id="blood_group" {...register("blood_group", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value="" disabled selected>Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                            {errors.blood_group && <span className="text-sm font-medium text-red-500">Blood Group is required</span>}
                        </div>  
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                        <button type="button" onClick={() => reset()} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Reset</button>
                        
                    </div>
                </form>
        </div>
        </div>

    </div>
    </>
)}    


export default OnBoardingForm;  