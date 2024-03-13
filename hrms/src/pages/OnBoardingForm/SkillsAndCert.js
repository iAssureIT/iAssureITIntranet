import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faBell,faSignOut, faPlus} from '@fortawesome/free-solid-svg-icons';
import { useState,useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import swal from 'sweetalert';
import moment from 'moment';
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { HiOutlineExclamationCircle } from 'react-icons/hi';
// import 'moment-timezone';

// import StepperWithContent from "./StepIndicator";

// import Joi from 'joi';
const TABLE_HEAD = ["Certification Name",  "Issued By","Certified On","Valid Till","Grade / Percentage","Action"];



function SkillsAndCert(){
   
const navigate = useNavigate();
const [user,setUser]=useState();
const [open,setOpen] = useState(true);
const [certificationName,setCertificationName] =useState('');
const [issuedBy,setIssuedBy] =useState('');
const [certifiedOn,setCertifiedOn] =useState('');
const [validTill,setValidTill] =useState();
const [gradePercentage,setGradePercentage] =useState('');
const [person_id,setPersonId] =useState('');
const [gender,setGender]=useState('');
const [reportingManager,setReportingManager]=useState('');
const [isChecked, setIsChecked] = useState(false)
const [skill,setSkill] = useState('');
const [skills,setSkills] = useState([]);
const [certification,setCertification]=useState([]);
const [certification_id,setCertificationId]=useState([]);
const [edit,setEdit]=useState(false);
const [deleteModal,setDeleteModal]=useState(false);
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
    resetField,
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
        setSkills(res.data.skills);
        setCertification(res.data.cerification)
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
      var certification= {
        "certificationName": certificationName,
        "issuedBy" : issuedBy,
        "certifiedOn" : certifiedOn,
        "ValidTill" : validTill,
        "percentageGrade" : gradePercentage
    }
    var formValues ={
        skills: skills,
        certification:certification,
        personID:person_id,
        edit,
        certification_id
    }
    console.log("formValues",formValues);
    axios.patch('/api/personmaster/patch/skillAndCert',formValues)
    .then(res=>{
      console.log("res",res);
      getEmployeeDetails(user.user_id);
      setEdit(false);
      // setAcademicList(oldArray => [...oldArray, academic]);
      setCertification('');
      setIssuedBy('');
      setCertification('');
      setValidTill('');
     setGradePercentage('');
    })
    .catch(err=>{
      console.log("err",err)
    })
}   

const editAcademicDetail=(index)=>{
    setEdit(true);
    // var academic = academicList[index];
    // setCe(academic.qualificationLevel);
    // setCollegeName(academic.collegeName);
    // setUniversityName(academic.universityName);
    // setSpecialization(academic.specialization);
    // setPassingyear(academic.passingYear);
    // setGradePercentage(academic.percentage);
    // setAcademicId(academic._id);
    // console.log("academic",academic);
   
  }

  const deleteAcademicDetails=(_id)=>{
    axios.delete('/api/personmaster/delete/academicDetails/'+person_id+"/"+_id)
    .then(res=>{
      console.log("res",res);
      deleteModal(false);
   
    })
    .catch(err=>{
      console.log("err",err)
    })
  }
    

    console.log("skills",skills)

  return(
    <>
    <div className="w-full p-7  overflow-scroll">
      <div className='bg-white mb-8 p-4'>
       {/* <StepperWithContent />  */}
    
       <div className='grid  grid-cols  '>
                <form className='p-4' onSubmit={handleSubmit(onSubmit)}>
               
                        <div className="mb-6">
                        <div className="grid gap-6 mb-6 rounded">
                            <div>
                                <label for="skill" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Skills<span className="text-red-500">*</span></label>
                                <input type="text" autoFocus id="skill"  onChange={(e)=>setSkill(e.target.value)}  {...register("skill")} 
                                onKeyDown={(e) => {
                                    if (e.key === "Enter"){
                                        console.log("enter",e.key);
                                        var skillsArray= skills
                                        skillsArray.push(e.target.value);
                                        setSkills(skillsArray);
                                        resetField("skill")
                                        // let theinput = document.querySelector("#skill"); //Get the input 
                                        // theinput.focus();
                                    }   
                                    }}
                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Skills"  />
                                {/* {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>} */}
                            </div>
                            <span>{
                                skills.map((item,index)=>{
                                    return(
                                        <span className="bg-site text-white p-2 mr-2"> {item}</span>
                                    )
                                })
                             }</span>
                        </div>
                       
                        <div  className="grid gap-6 md:grid-cols-3 mb-6 mt-4 rounded">
                            <div >
                                <label for="certificationName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Certification Name<span className="text-red-500">*</span></label>
                                <input type="text" id="certificationName"  value={certificationName} {...register("certificationName")} onChange={(e)=>setCertificationName(e.target.value)}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                {/* {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>} */}
                            </div>
                            <div >
                                <label for="issuedBy" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Issued By<span className="text-red-500">*</span></label>
                                <input type="text" id="issuedBy"  value={issuedBy} {...register("issuedBy")} onChange={(e)=>setIssuedBy(e.target.value)}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                {/* {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>} */}
                            </div>
                                <div>
                                    <label for="certifiedOn" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Certified On<span className="text-red-500">*</span></label>
                                    <input type="date" id="certifiedOn" value={moment(certifiedOn).utc().format('YYYY-DD-MM',{required:false})}  {...register("certifiedOn",{required:true})} onChange={(e)=>setCertifiedOn(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Certified On" required/>
                                    {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3 mb-6 mt-4 rounded">
                            <div >
                                <label for="validTill" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Valid Till<span className="text-red-500">*</span></label>
                                <input type="date" id="validTill"  value={moment(validTill).utc().format('YYYY-DD-MM',{required:false})} {...register("validTill")} onChange={(e)=>setValidTill(e.target.value)}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                {/* {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>} */}
                            </div>
                                <div>
                                    <label for="gradePercentage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Grade / Percentage<span className="text-red-500">*</span></label>
                                    <input type="text" id="gradePercentage" value={gradePercentage}  {...register("gradePercentage",{required:true})} onChange={(e)=>setGradePercentage(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Grade Percentage" required/>
                                    {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                                </div>
                            </div>
                        </div>
                    <div className="px-6 flex justify-end">
                        <button type="submit" onClick={()=>reset()} className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{edit ? "Update":"Add"}</button>
                     </div>
                    </form>
                      
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
                            {academicList && academicList.length >0?
                            academicList.map(({ certificationName,issuedBy,certifiedOn,validTill,gradePercentage,_id}, index) => {
                            const isLast = index === academicList.length - 1;
                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                            return (
                                <tr key={index}>
                                <td className={classes}>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                    >
                                    {certificationName}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                    >
                                    {issuedBy}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                    >
                                    {certifiedOn}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                    >
                                    {validTill}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                    >
                                    {gradePercentage}
                                    </Typography>
                                </td>
                                

                                <td className={classes}>
                            <Tooltip content="Edit" >
                                <IconButton variant="text" onClick={()=>{editAcademicDetail(index)}}>
                                <PencilIcon className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete">
                                <IconButton variant="text"  onClick={()=>{setDeleteModal(true)}}>
                                <TrashIcon className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                            </td>
                            <Modal show={deleteModal} size="md" onClose={() => setDeleteModal(false)} popup>
                                <Modal.Header />
                                <Modal.Body>
                                <div className="text-center">
                                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete this user?
                                    </h3>
                                    <div className="flex justify-center gap-4">
                                    <Button color="failure" onClick={() => deleteAcademicDetails(_id)}>
                                        {"Yes, I'm sure"}
                                    </Button>
                                    <Button color="gray" onClick={() => setDeleteModal(false)}>
                                        No, cancel
                                    </Button>
                                    </div>
                                </div>
                                </Modal.Body>
                            </Modal>
                                </tr>
                            )})
                            :
                            <tr >
                                <td colSpan={7} >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal text-center p-2"
                                    >
                                    NO ROW FOUND
                                    </Typography>
                                </td>
                                </tr>
                                }
                        </tbody>
                        </table>
                    </Card>
                    <div className="flex justify-between mt-6">
                    <button type="button" onClick={() => reset()} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Previous</button>
                    <button type="submit"  className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next</button>
                </div>
        </div>
        </div>

    </div>
    </>
)}    


export default SkillsAndCert;  