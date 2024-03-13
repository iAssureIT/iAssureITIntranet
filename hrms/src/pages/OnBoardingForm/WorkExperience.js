import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faBell,faSignOut, faPlus} from '@fortawesome/free-solid-svg-icons';
import { useState,useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip  } from 'react-tooltip';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import swal from 'sweetalert';
import moment from 'moment';
import { Button, Modal } from 'flowbite-react';
// import 'moment-timezone';

// import StepperWithContent from "./StepIndicator";

// import Joi from 'joi';


function WorkExperience(){
   
const navigate = useNavigate();
const [user,setUser]=useState();
const [open,setOpen] = useState(true);
const [companyName,setQCompanyName] =useState('');
const [location,setLocation] =useState('');
const [designation,setDesignation] =useState('');
const [workingForm,setWorkingFrom] =useState(new Date());
const [workingTill,setWorkingTill] =useState((new Date()));
const [gradePercentage,setGradePercentage] =useState('');
const [person_id,setPersonId] =useState('');
const [gender,setGender]=useState('');
const [reportingManager,setReportingManager]=useState('');
const [isChecked, setIsChecked] = useState(false)

const handleCheckboxChange = () => {
  setIsChecked(!isChecked)
}

const academicCount=
  {
    qualificationLevel1:"",
    collegeName1:"",
    universityName1:"",
    specialization1:"",
    passingYear1:"",
    gradePercentage1:""
  }

  const [academicList,setAcademicList]=useState([academicCount])

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
//   getEmployeeDetails(user.user_id);
},[1]);




const getEmployeeDetails=(user_id)=>{
    axios.get('api/personmaster/get/details/'+user_id)
  .then((res)=>{
    if(res?.data){
        console.log("res",res);
        setPersonId(res.data._id)
        // setQualificationLevel(res.data.qualificationLevel);
        // setCollegeName(res.data.collegeName)
        // setUniversityName(res.data.universityName);
        // setSpecialization(res.data.specialization)
        // setPassingyear(res.data.passingYear);
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

    console.log("academicCount",academicCount);

    function addAcademicFunc(count){
      console.log("count",count);
      var academic= {
        ["qualificationLevel"+count]:"",
        ["collegeName"+count]:"",
        ["universityName"+count]:"",
        ["specialization"+count]:"",
        ["passingYear"+count]:"",
        ["gradePercentage"+count]:""
      }
      setAcademicList(oldArray => [...oldArray, academic]);
    }

  return(
    <>
    <div className="w-full p-7">
      <div className='bg-white mb-8 p-4'>
       {/* <StepperWithContent />  */}
       <label className='themeSwitcherTwo shadow-card relative inline-flex cursor-pointer select-none items-center mb-6 rounded-3xl	border-2 bg-white p-1'>
            <input
                type='checkbox'
                className='sr-only'
                checked={isChecked}
                onChange={handleCheckboxChange}
            />
            <span
                className={`flex items-center space-x-[6px] rounded-3xl py-2 px-[18px] text-sm font-medium ${
                !isChecked ? 'text-white bg-site' : 'text-body-color'
                }`}
            >
                
                Fresher
            </span>
            <span
                className={`flex items-center space-x-[6px] rounded-3xl py-2 px-[18px] text-sm font-medium ${
                isChecked ? 'text-white bg-site' : 'text-body-color'
                }`}
            >
                
                Experience
            </span>
            </label>
       <div className='grid  grid-cols  '>
   
          <div className="flex gap-1 ">
            <span className='text-left text-xl font-semibold'> Company Details :</span>
              <Button className="bg-site h-8" onClick={()=>addAcademicFunc((academicCount.length)+1)}> <FontAwesomeIcon  className='w-4 h-4 cursor-pointer'  icon={faPlus} color='#fff'  onClick={()=>{}}/>Add Company Details</Button>
          </div>  
         
                <form className='my-6 h-screen p-4' onSubmit={handleSubmit(onSubmit,onErrors)}>
                {academicList ?
                academicList.map(({item,index})=>{
                    return(
                        <div className="mb-6">
                        <span className='text-left text-l font-semibold'> Company Detail :</span>
                        <div key={index} className="grid gap-6 md:grid-cols-3 mb-6 mt-4 rounded">
                            <div>
                                <label for="companyName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Company Name<span className="text-red-500">*</span></label>
                                <input type="text" id="companyName" value={companyName}  {...register("companyName")} onChange={(e)=>setQCompanyName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Company Name" required />
                                {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>}
                            </div>
                            <div>
                                <label for="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location<span className="text-red-500">*</span></label>
                                <input type="text" id="location"  value={location}  {...register("location",{required:true})} onChange={(e)=>setLocation(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Location" required />
                                {errors.collegeName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>}
                            </div>
                            <div>
                                <label for="designation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Designation<span className="text-red-500">*</span></label>
                                <input type="text" id="designation" value={designation}  {...register("designation",{required:true})} onChange={(e)=>setDesignation(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Designation" required/>
                                {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>}
                            </div>
                        </div>
                        <div key={index} className="grid gap-6 md:grid-cols-3 mb-6 mt-4 rounded">
                        <div >
                            <label for="workingForm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Working From<span className="text-red-500">*</span></label>
                            <input type="date" id="workingForm"  value={moment(workingForm).utc().format('YYYY-DD-MM',{required:true})} {...register("workingForm")} onChange={(e)=>setWorkingFrom(e.target.value)}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                            {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>}
                        </div>
                        <div >
                            <label for="workingTill" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Working Till<span className="text-red-500">*</span></label>
                            <input type="date" id="workingTill"  value={moment(workingTill).utc().format('YYYY-DD-MM',{required:true})} {...register("workingTill")} onChange={(e)=>setWorkingTill(e.target.value)}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                            {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>}
                        </div>
                            <div>
                                <label for="reportingManager" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Reporting Manager<span className="text-red-500">*</span></label>
                                <input type="text" id="reportingManager" value={reportingManager}  {...register("reportingManager",{required:true})} onChange={(e)=>setReportingManager(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Reporting Manager" required/>
                                {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>}
                            </div>
                        </div>
                 
                        </div>
                    )}):[]}
                <div className="flex justify-between">
                    <button type="button" onClick={() => {}} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Previous</button>
                    <button type="submit"  className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next</button>
                </div>
            </form>
        </div>
        </div>

    </div>
    </>
)}    


export default WorkExperience;  