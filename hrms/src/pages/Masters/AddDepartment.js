import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const TABLE_HEAD = ["Department",  "Action"];

function AddDepartment() {
    const [open,setOpen] = useState(true);
    const [departmentList,setdepartmentList] = useState([]);
    const [update,setUpdate] = useState(false);
    const [department,setdepartment] = useState('');
    const [department_id,setdepartmentId] = useState('');
    const [deleteModal,setDeleteModal]=useState(false) ;
    const [deleteDept_id,setDeleteDeptId]=useState('')
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getdepartmentList()
      },[1]);

      const onSubmit = (data) => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        
          if(update){
            var formValues = {
                fieldValue: data.department,
                fieldID :department_id,
                updatedBy : user.user_id,
              }
            axios.patch('/api/department/patch', formValues)
          .then((response) => {
                console.log("response",response);
                  if(response.data.updated){
                    swal({
                        text: "Department Updated Successfully."
                    });
                }else{
                    swal({
                        text: "Department Already Added."
                    });
                }
                setUpdate(false);
                setdepartmentId('');
                getdepartmentList();
                setdepartment('');
  
          })
          .catch((error) => {
            console.log("error", error);
          
          });
        }
       else{
        var formValues = {
            fieldValue: data.department,
            user_id: user.user_id,
          }
        axios.post('/api/department/post', formValues)
            .then((response) => {
                console.log("response",response);
                if(response.data.created){
                    swal({
                        text: "Department Added Successfully."
                    });
                }else{
                    swal({
                        text: "Department Already Added."
                    });
                }
                getdepartmentList();
                setdepartment('');
            })
            .catch((error) => {
            console.log("error", error);
            
            });
        }
        
    };

    const getdepartmentList =()=>{
        axios.post('/api/department/get/list')
        .then((response) => {
         console.log("response department",response);
         var departmentList = [];
         for (let index = 0; index < response.data.length; index++) {
             let departmentData ={
                department_id : response.data[index]._id,
                department:response.data[index].department
             } 
             departmentList.push(departmentData);
         }
         setdepartmentList(departmentList)
         console.log("departmentList",departmentList);
        })
        .catch((err)=>console.log("err",err))
    }

    const editUser=(data)=>{
        console.log("department",data);
        setUpdate(true);
        setdepartment(data.department) ;
        setdepartmentId(data.department_id)
    }

    const deleteDepartment=()=>{
      console.log("deleteDept_id",deleteDept_id);
        axios.delete('/api/department/delete/'+deleteDept_id)
        .then((response) => {
         console.log("response department",response);
            swal({
            text: "Department Deleted Successfully."
            });
            setDeleteModal(false);
            getdepartmentList();
        })
        .catch((err)=>console.log("err",err))
    }

  return (
    <div className="w-full  ">
      
     
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <form className='flex grid-cols'  onSubmit={handleSubmit(onSubmit)}>
                <div class="grid mb-6 md:grid-cols-2">
                        <input type="text" id="department"{...register("department",{required:true})} value={department} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Department..." required onChange={(e)=>setdepartment(e.value)} />
               </div>
               <div class="grid mb-6 md:grid-cols-2">
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
                    {departmentList && departmentList.length >0?
                    departmentList.map(({ department }, index) => {
                    const isLast = index === departmentList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={department}>
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
                        <IconButton variant="text" onClick={()=>editUser(departmentList[index])}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text"   onClick={()=>{setDeleteModal(true);setDeleteDeptId(departmentList[index].department_id)}}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                    </td>
                        </tr>
                    )})
                     :
                    <tr >
                        <td colSpan={2} >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-center p-2"
                            >
                            NO DEPARTMENT FOUND
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
              Are you sure you want to delete this department?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteDepartment()}>
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

export default AddDepartment;
