import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPencil, faUser} from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';
import StatBox from '../../components/StatBox/StatBox';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";


const TABLE_HEAD = ["Designation",  "Action"];

function AddDesignation() {
    const [open,setOpen] = useState(true);
    const [designationList,setdesignationList] = useState([]);
    const [update,setUpdate] = useState(false);
    const [designation,setdesignation] = useState('');
    const [designation_id,setdesignationId] = useState('');
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getdesignationList()
      },[1]);

      const onSubmit = (data) => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        
          if(update){
            var formValues = {
                fieldValue: data.designation,
                fieldID :designation_id,
                updatedBy : user.user_id,
              }
            axios.patch('/api/Designation/patch', formValues)
          .then((response) => {
                console.log("response",response);
                  if(response.updated){
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
                setdesignation('');
  
          })
          .catch((error) => {
            console.log("error", error);
          
          });
        }
       else{
        var formValues = {
            fieldValue: data.designation,
            user_id: user.user_id,
          }
        axios.post('/api/Designation/post', formValues)
            .then((response) => {
                console.log("response",response);
                if(response.created){
                    swal({
                        text: "Designation Added Successfully."
                    });
                }else{
                    swal({
                        text: "Designation Already Added."
                    });
                }
                getdesignationList();
                setdesignation('');
            })
            .catch((error) => {
            console.log("error", error);
            
            });
        }
        
    };

    const getdesignationList =()=>{
        axios.post('/api/Designation/get/list')
        .then((response) => {
         console.log("response designation",response);
         var designationList = [];
         for (let index = 0; index < response.data.length; index++) {
             let designationData ={
                designation_id : response.data[index]._id,
                designation:response.data[index].designation
             } 
             designationList.push(designationData);
         }
         setdesignationList(designationList)
         console.log("designationList",designationList);
        })
        .catch((err)=>console.log("err",err))
    }

    const editUser=(data)=>{
        console.log("designation",data);
        setUpdate(true);
        setdesignation(data.designation) ;
        setdesignationId(data.designation_id)
    }

    const deleteUser=(data)=>{
        console.log("designation",data);
        axios.delete('/api/Designation/delete/'+data.designation_id)
        .then((response) => {
         console.log("response designation",response);
            swal({
            text: "Designation Deleted Successfully."
            });
            getdesignationList();
        })
        .catch((err)=>console.log("err",err))
    }

  return (
    <div className="w-full  ">
      
     
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <form className='flex grid-cols'  onSubmit={handleSubmit(onSubmit)}>
                <div class="grid mb-6 md:grid-cols-2">
                        <input type="text" id="designation"{...register("designation",{required:true})} value={designation} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Designation..." required onChange={(e)=>setdesignation(e.value)} />
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
                    {designationList.map(({ designation }, index) => {
                    const isLast = index === designationList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={designation}>
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
                      <Tooltip content="Edit User" >
                        <IconButton variant="text" onClick={()=>editUser(designationList[index])}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete User">
                        <IconButton variant="text"  onClick={()=>deleteUser(designationList[index])}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </Card>

    </div>
  );
}

export default AddDesignation;
