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

const TABLE_HEAD = ["Organization Level",  "Action"];

function AddOrgLevel() {
    const [open,setOpen] = useState(true);
    const [orgLevelList,setOrgLevelList] = useState([]);
    const [update,setUpdate] = useState(false);
    const [orgLevel,setOrgLevel] = useState('');
    const [orgLevel_id,setOrgLevelId] = useState('');
    const [deleteModal,setDeleteModal]=useState(false) ;
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()


    useEffect(() => {
        getOrganisationList()
      },[1]);

      const onSubmit = (data) => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("data",data);
        
          if(update){
            var formValues = {
                fieldValue: data.orgLevel,
                fieldID :orgLevel_id,
                updatedBy : user.user_id,
              }
            axios.patch('/api/orgLevel/patch', formValues)
          .then((response) => {
                console.log("response",response);
                  if(response.updated){
                    swal({
                        text: "Organization Level Updated Successfully."
                    });
                }else{
                    swal({
                        text: "Organization Level Already Added."
                    });
                }
                setUpdate(false);
                setOrgLevelId('');
                getOrganisationList();
                setOrgLevel('');
  
          })
          .catch((error) => {
            console.log("error", error);
          
          });
        }
       else{
        var formValues = {
            fieldValue: data.orgLevel,
            user_id: user.user_id,
          }
        axios.post('/api/orgLevel/post', formValues)
            .then((response) => {
                console.log("response",response);
                if(response.created){
                    swal({
                        text: "organization Level Added Successfully."
                    });
                }else{
                    swal({
                        text: "organization Level Already Added."
                    });
                }
                getOrganisationList();
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

    const editUser=(data)=>{
        console.log("orgLevel",data);
        setUpdate(true);
        setOrgLevel(data.orgLevel) ;
        setOrgLevelId(data.orgLevel_id)
    }

    const deleteUser=()=>{
        axios.delete('/api/orgLevel/delete/'+orgLevel_id)
        .then((response) => {
         console.log("response orgLevel",response);
            swal({
            text: "Organization Level Deleted Successfully."
            });
            getOrganisationList();
            setDeleteModal(false);
        })
        .catch((err)=>console.log("err",err))
    }

  return (
    <div className="w-full  ">
      
     
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            <form className='flex grid-cols'  onSubmit={handleSubmit(onSubmit)}>
                <div class="grid mb-6 md:grid-cols-2">
                        <input type="text" id="orgLevel"{...register("orgLevel",{required:true})} value={orgLevel} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Organization Level..." required onChange={(e)=>setOrgLevel(e.value)} />
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
                    {orgLevelList.map(({ orgLevel }, index) => {
                    const isLast = index === orgLevelList.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={orgLevel}>
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
                        <IconButton variant="text" onClick={()=>editUser(orgLevelList[index])}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text"  onClick={()=>{setDeleteModal(true);setOrgLevelId(orgLevelList[index].orgLevel_id)}}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                    </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </Card>
            <Modal show={deleteModal} size="md" onClose={() => setDeleteModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete organization level?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteUser()}>
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

export default AddOrgLevel;
