import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faBell,faSignOut} from '@fortawesome/free-solid-svg-icons';
import { useState,useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip  } from 'react-tooltip';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import swal from 'sweetalert';
import moment from 'moment';
// import 'moment-timezone';

// import StepperWithContent from "./StepIndicator";

// import Joi from 'joi';


function AcademicDetails(){
   
const navigate = useNavigate();
const [user,setUser]=useState();
const [open,setOpen] = useState(true);
const [qualificationLevel,setQualificationLevel] =useState('');
const [collegeName,setCollegeName] =useState('');
const [universityName,setUniversityName] =useState('');
const [specialization,setSpecialization] =useState('');
const [passingYear,setPassingyear] =useState('');
const [gradePercentage,setGradePercentage] =useState('');
const [person_id,setPersonId] =useState('');
const [gender,setGender]=useState('');

const [activeStep, setActiveStep] = React.useState(0);
  const [isLastStep, setIsLastStep] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(false);
 
  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);
 

const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm()


useEffect(() => {
  var user =  JSON.parse(localStorage.getItem('userDetails'));
  setUser(user);
  clearErrors();
  console.log("user",user);
  getEmployeeDetails(user.user_id);
},[1]);




const getEmployeeDetails=(user_id)=>{
    axios.get('api/personmaster/get/details/'+user_id)
  .then((res)=>{
    if(res?.data){
        console.log("res",res);
        setPersonId(res.data._id)
        setQualificationLevel(res.data.qualificationLevel);
        setCollegeName(res.data.collegeName)
        setUniversityName(res.data.universityName);
        setSpecialization(res.data.specialization)
        setPassingyear(res.data.passingYear);
        setGradePercentage(res.data.gradePercentage);
    }
   
  })
  .catch(err=>{
    console.log("err",err);
  })
}


function format(s) {
    return s.toString().replace(/\d{4}(?=.)/g, '$&-');
}


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
            "personID":person_id,
            "qualificationLevel": data.qualificationLevel,
            "collegeName": data.collegeName,
            "universityName": data.universityName,
            "dob": data.dob, 
            "gender":gender,
            "maritalStatus":data.maritalStatus,
            "nationality":data.nationality,
            "aadharCardNo": (data.aadhar_card_no).replaceAll('-', ''),
            "panCardNo": data.pan_card_no, 
            "addressLine":data.addressLine1,
            "city": data.city, 
            "state": data.state, 
            "country":data.country,
            "pincode":data.pincode,
            "personalEmail" : data.personal_email, 
            "personalMobileNo": data.personal_mobile, 
            "alternateMobileNo": data.alternate_no, 
            "bloodGroup": data.blood_group,
          }
        console.log("here formvalues ==", formValues)
        // api- data should be update and status should change from pending to Unverified
        axios.patch('/api/personmaster/patch',formValues)
        .then((res) => {
            console.log("res",res);
            swal({
                text: "Employee Personal Info Updated Successfully"
            });
            // navigate to another screen where user able to filled info with unverified status
        })
        .catch((err)=>console.log("err",err)) // on error show error msg and form should be reset
    }   

    const onErrors = errors => console.error(errors);
  return(
    <>
    <div className="w-full">
      <div className='p-7 text-xl font-semibold'>
       {/* <StepperWithContent />  */}
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            
            <span className='text-left'> Academic Details :</span>
            <form className='bg-blue-200 my-6 h-screen p-4' onSubmit={handleSubmit(onSubmit,onErrors)}>
                    <div className="grid gap-6 md:grid-cols-3 mb-6  rounded">
                        <div>
                            <label for="qualificationLevel" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Qualification Level<span className="text-red-500">*</span></label>
                            <input type="text" id="qualificationLevel" value={qualificationLevel}  {...register("qualificationLevel")} onChange={(e)=>setQualificationLevel(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Qualification" required />
                            {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>}
                        </div>
                        <div>
                            <label for="collegeName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">College Name<span className="text-red-500">*</span></label>
                            <input type="text" id="collegeName"  value={collegeName}  {...register("collegeName",{required:true})} onChange={(e)=>setCollegeName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter College Name" required />
                            {/* {errors.collegeName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>} */}
                        </div>
                        <div>
                            <label for="universityName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">University Name<span className="text-red-500">*</span></label>
                            <input type="text" id="universityName" value={universityName}  {...register("universityName",{required:true})} onChange={(e)=>setUniversityName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter University Name" required/>
                            {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3 mb-6  rounded">
                        <div>
                            <label for="specialization" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Specialization<span className="text-red-500">*</span></label>
                            <input type="text" id="specialization" value={specialization}  {...register("specialization")} onChange={(e)=>setSpecialization(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Specialization" required />
                            {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>}
                        </div>
                        <div>
                            <label for="passingYesr" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Passing Year<span className="text-red-500">*</span></label>
                            <input type="text" id="passingYesr"  value={passingYear}  {...register("passingYesr",{required:true})} onChange={(e)=>setPassingyear(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Passing Year" required />
                            {/* {errors.collegeName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>} */}
                        </div>
                        <div>
                            <label for="gradePercentage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Grade / Percentage<span className="text-red-500">*</span></label>
                            <input type="text" id="gradePercentage" value={gradePercentage}  {...register("gradePercentage",{required:true})} onChange={(e)=>setGradePercentage(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Grade/Percentage" required/>
                            {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit"  className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                        <button type="button" onClick={() => reset()} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Reset</button>
                        
                    </div>
                </form>
        </div>
        </div>

    </div>
    </>
)}    


export default AcademicDetails;  