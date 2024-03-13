import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useState,useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import {useNavigate} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import swal from 'sweetalert';
import { Button, Modal } from 'flowbite-react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import moment from 'moment';
import { HiOutlineExclamationCircle } from 'react-icons/hi';


const TABLE_HEAD = ["Qualification Level",  "College Name","University Name","Specialization","Passing Year","Grade / Percentage","Action"];

function AcademicDetails(){
   
const navigate = useNavigate();
const [user,setUser]=useState('');
const [qualificationLevel,setQualificationLevel] =useState('');
const [collegeName,setCollegeName] =useState('');
const [universityName,setUniversityName] =useState('');
const [specialization,setSpecialization] =useState('');
const [passingYear,setPassingyear] =useState('');
const [gradePercentage,setGradePercentage] =useState('');
const [person_id,setPersonId] =useState('');
const [academic_id,setAcademicId] =useState('');
const [edit,setEdit]=useState(false);
const [gender,setGender]=useState('');
const [deleteModal,setDeleteModal]=useState(false);

  const [academicList,setAcademicList]=useState([])

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
       setAcademicList(res?.data?.academicDetails);
    }
   
  })
  .catch(err=>{
    console.log("err",err);
  })
}


    
    const onSubmit = (data) => {
        console.log("data here ====",data);
          var academic= {
            "qualificationLevel":data.qualificationLevel,
            "collegeName":data.collegeName,
            "universityName":data.universityName,
            "specialization":data.specialization,
            "passingYear":data.passingYear,
            "percentage":data.gradePercentage,
        }
        var formValues ={
          academic: academic,
          personID:person_id,
          edit,
          academic_id
        }
        axios.patch('/api/personmaster/patch/academicDetails',formValues)
        .then(res=>{
          console.log("res",res);
          getEmployeeDetails(user.user_id);
          setEdit(false);
          // setAcademicList(oldArray => [...oldArray, academic]);
          setQualificationLevel('');
          setCollegeName('');
          setUniversityName('');
          setSpecialization('');
          setPassingyear('');
          setGradePercentage('');
        })
        .catch(err=>{
          console.log("err",err)
        })
    }   

    const onErrors = errors => console.error(errors);

    const editAcademicDetail=(index)=>{
      setEdit(true);
      var academic = academicList[index];
      setQualificationLevel(academic.qualificationLevel);
      setCollegeName(academic.collegeName);
      setUniversityName(academic.universityName);
      setSpecialization(academic.specialization);
      setPassingyear(academic.passingYear);
      setGradePercentage(academic.percentage);
      setAcademicId(academic._id);
      console.log("academic",academic);
     
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

  console.log("academicList",academicList);

  return(
    <>
    <div className="w-full p-7">
      <div className='bg-white mb-8 h-screen'>
       <div className='grid  grid-cols p-4' >
          <div className="flex gap-1">
            <span className='text-left text-xl font-semibold'> Academic Details  :</span>
          </div>  
                <form className='p-4' onSubmit={handleSubmit(onSubmit,onErrors)}>
                    <div className="grid gap-6 md:grid-cols-3 mb-6 mt-4 rounded">
                    <div>
                        <label for={"qualificationLevel"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Qualification Level<span className="text-red-500">*</span></label>
                        <input type="text" id={"qualificationLevel"} value={qualificationLevel}  {...register("qualificationLevel")} 
                        // onChange={updateFieldChanged('qualificationLevel',index)} 
                        onChange={(e)=>setQualificationLevel(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Qualification" required />
                        {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>}
                    </div>
                    <div>
                        <label for={"collegeName"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">College Name<span className="text-red-500">*</span></label>
                        <input type="text" id={"collegeName"} value={collegeName}  {...register("collegeName",{required:false})} 
                      // onChange={updateFieldChanged('collegeName',index)} 
                      onChange={(e)=>setCollegeName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter College Name" required />
                        {/* {errors.collegeName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>} */}
                    </div>
                    <div>
                        <label for={"universityName"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">University Name<span className="text-red-500">*</span></label>
                        <input type="text" id={"universityName"} value={universityName}  {...register("universityName",{required:false})} 
                          // onChange={updateFieldChanged('universityName',index)} 
                      onChange={(e)=>setUniversityName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter University Name" required/>
                        {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3 mb-6  rounded">
                    <div>
                        <label for={"specialization"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Specialization<span className="text-red-500">*</span></label>
                        <input type="text" id={"specialization"} value={specialization}  {...register("specialization")} 
                        // onChange={updateFieldChanged('specialization',index)} 
                      onChange={(e)=>setSpecialization(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Specialization" required />
                        {errors.qualificationLevel && <span className="text-sm font-medium text-red-500">{errors.qualificationLevel.message}</span>}
                    </div>
                    <div>
                        <label for={"passingYear"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Passing Year<span className="text-red-500">*</span></label>
                        <input type="date" id={"passingYear"}   value={moment(passingYear).utc().format('YYYY-DD-MM',{required:false})} {...register("passingYear",{required:false})} 
                        // onChange={updateFieldChanged('passingYear',index)} 
                      onChange={(e)=>setPassingyear(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Passing Year" required />
                        {/* {errors.collegeName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>} */}
                    </div>
                    <div>
                        <label for={"gradePercentage"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Grade / Percentage<span className="text-red-500">*</span></label>
                        <input type="text" id={"gradePercentage"} value={gradePercentage}  {...register("gradePercentage",{required:false})} 
                        // onChange={updateFieldChanged('gradePercentage',index)} 
                        onChange={(e)=>setGradePercentage(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Grade/Percentage" required/>
                        {/* {errors.universityName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
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
                    academicList.map(({ qualificationLevel,collegeName,percentage,passingYear,specialization,universityName,_id}, index) => {
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
                            {qualificationLevel}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {collegeName}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {universityName}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {specialization}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {passingYear}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {percentage}
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
                    <button type="submit" onClick={()=>navigate('/skillsAndCert')} className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next</button>
                </div>
        </div>
        </div>
    </div>
   
    </>
)}    


export default AcademicDetails;  