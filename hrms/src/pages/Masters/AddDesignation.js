import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';


const TABLE_HEAD = ["Level","Department","Designation",  "Action"];

function AddDesignation() {
    const [open,setOpen] = useState(true);
    const [designationList,setdesignationList] = useState([]);
    const [update,setUpdate] = useState(false);
    const [designation,setDesignation] = useState('');
    const [designation_id,setdesignationId] = useState('');
    const [orgLevelList,setOrgLevelList] = useState([]);
    const [departmentList,setDepartmentList] = useState([]);
    const [deleteModal,setDeleteModal]=useState(false) ;
    const [deleteDes_id,setDeleteDesId]=useState('');
    const [orgLevel,setOrgLevel]=useState('');
    const [department,setDepartment]=useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getdesignationList();
        getOrganisationList();
        getDepartmentList();
      },[1]);

      const onSubmit = (data) => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        
          if(update){
            var formValues = {
                fieldValue  : data.designation,
                orgLevel    : data.orgLevel,
                department  : data.department,
                fieldID     : designation_id,
                updatedBy   : user.user_id,
              }
              console.log("formValues",formValues);
            axios.patch('/api/Designation/patch', formValues)
          .then((response) => {
                console.log("response",response);
                  if(response.data.updated){
                    swal({
                        text: "Designation Updated Successfully."
                    });
                }else{
                    swal({
                        text: "Designation Already Added."
                    });
                }
                setUpdate(false);
                setdesignationId('');
                getdesignationList();
                setDesignation('');
                setDepartment('');
                setOrgLevel('');
          })
          .catch((error) => {
            console.log("error", error);
          
          });
        }
       else{
        var formValues = {
            fieldValue: data.designation,
            orgLevel    : data.orgLevel,
            department  : data.department,
            user_id: user.user_id,
          }
        axios.post('/api/Designation/post', formValues)
            .then((response) => {
                console.log("response",response);
                if(response.data.created){
                    swal({
                        text: "Designation Added Successfully."
                    });
                }else{
                    swal({
                        text: "Designation Already Added."
                    });
                }
                getdesignationList();
                setDesignation('');
                setDepartment('');
                setOrgLevel('');
            })
            .catch((error) => {
            console.log("error", error);
            
            });
        }
        
    };

    const getOrganisationList =()=>{
      axios.post('/api/orgLevel/get/list')
      .then((response) => {
       console.log("response orgLevel",response);
       var orgLevelList = [];
       for (let index = 0; index < response.data.length; index++) {
           let orgLevelData ={
              orgLevel_id : response.data[index]._id,
              orgLevel:response.data[index].orgLevel
           } 
           orgLevelList.push(orgLevelData);
       }
       setOrgLevelList(orgLevelList)
       console.log("orgLevelList",orgLevelList);
      })
      .catch((err)=>console.log("err",err))
  }
    

    const getdesignationList =()=>{
        axios.get('/api/Designation/get/list')
        .then((response) => {
         console.log("response designation",response);
         var designationList = [];
         for (let index = 0; index < response.data.length; index++) {
             let designationData ={
                designation_id : response.data[index]._id,
                designation:response.data[index].designation,
                department:response.data[index].department,
                orgLevel:response.data[index].orgLevel
             } 
             designationList.push(designationData);
         }
         setdesignationList(designationList)
         console.log("designationList",designationList);
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
      })
      .catch((err)=>console.log("err",err))
  }

    const editUser=(data)=>{
        console.log("designation",data);
        setUpdate(true);
        setDesignation(data.designation);
        setDepartment(data.department);
        setOrgLevel(data.orgLevel);
        setdesignationId(data.designation_id)
    }

    const deleteDesignation=()=>{
        axios.delete('/api/Designation/delete/'+deleteDes_id)
        .then((response) => {
         console.log("response designation",response);
            swal({
                text: "Designation Deleted Successfully."
            });
            setDeleteModal(false);
            getdesignationList();
        })
        .catch((err)=>console.log("err",err))
    }

  return (
    <div className="w-full  ">
      
     
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <form className='flex grid-cols gap-12'  onSubmit={handleSubmit(onSubmit)}>
               <div >
                  <select id="orgLevel" {...register("orgLevel",{required:true})} value={orgLevel} onChange={(e)=>setOrgLevel(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option selected>Select Organization Level</option>
                      {orgLevelList &&
                          orgLevelList.map((item,index)=>{
                              return(
                                  <option value={item.orgLevel}>{item.orgLevel}</option>
                              )
                          })
                      }
                  </select>
              </div> 
              <div >
                  <select id="department" {...register("department",{required:true})} value={department} onChange={(e)=>setDepartment(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
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
              <div className="grid mb-6 ">
                        <input type="text" id="designation"{...register("designation",{required:true})} value={designation} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Designation..." required onChange={(e)=>setDesignation(e.value)} />
               </div>
               <div className="grid mb-6 md:grid-cols-2">
                    <button type="submit" className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{update?"Update":"Submit"}</button>
                 </div>
            </form>
        </div>
        </div>
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
                    {designationList && designationList.length >0?
                    designationList.map(({ designation,orgLevel,department }, index) => {
                    const isLast = index === designationList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={index}>
                             <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {orgLevel}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {department}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {designation}
                            </Typography>
                        </td>
                        
                        <td className={classes}>
                        <IconButton variant="text" onClick={()=>editUser(designationList[index])}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text"  onClick={()=>{setDeleteModal(true);setDeleteDesId(designationList[index].designation_id)}}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                    </td>
                        </tr>
                   
                    )})
                    :
                    <tr >
                        <td colSpan={4} >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-center p-2"
                            >
                            NO DESIGNATION FOUND
                            </Typography>
                        </td>
                        </tr>
                        }
                </tbody>
                </table>
            </Card>
            <Modal show={deleteModal} size="md" onClose={() => setDeleteModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this designation?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteDesignation()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AddDesignation;
