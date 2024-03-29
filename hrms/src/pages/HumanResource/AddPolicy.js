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
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { FileInput, Label } from 'flowbite-react';
import S3FileUpload from 'react-s3';
window.Buffer = window.Buffer || require("buffer").Buffer; 

const schema = yup.object().shape({
    policy_name: yup.string().required('This field is required'),
    policy_category: yup.string().required('This field is required'),
    // policy_summary: yup.string().required('This field is required'),
    // policy_doc: yup.string().required('This field is required'),
  });

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
    const [policy_doc,setPolicyDoc] = useState('');
    const [image, setImage] = useState(null);
    const {
        register,
        handleSubmit,
        watch,
        reset,
        clearErrors,
        formState: { errors },
      } = useForm({
        resolver: yupResolver(schema),
      })

    useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        setUser(user);
        setPolicyName(policy?.policy_name?policy?.policy_name:'');
        setPolicyCategory(policy?.policy_category?policy?.policy_category:'');
        setPolicySummary(policy?.policy_summary?policy?.policy_summary:'');
        setPolicyDoc(policy?.policy_doc?policy?.policy_doc:'');
        reset(policy);
      },[props]);

    


    const onSubmit = (data) => {
        const formValues = {
            "policy_name"       : data.policy_name,
            "policy_category"   : data.policy_category,
            "policy_summary"    : policy_summary,
            "policy_doc"      : policy_doc,
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

    const handleImageChange = (event) => {
        event.preventDefault();
        var image =[];
            if (event.currentTarget.files && event.currentTarget.files[0]) {
                for (var i = 0; i < event.currentTarget.files.length; i++) {
                    var file = event.currentTarget.files[i];
                    if (file) {
                        console.log("file",file);
                        var fileName = file.name;
                        var fileSize = file.size;
                        var ext = fileName.split('.').pop();
                        console.log("ext",ext);
                        if (ext === "pdf" || ext === "docx" || ext === "PDF" ||  ext === "DOCX") {
                            if (file) {
                                var objTitle = { fileInfo: file }
                              // setImage(objTitle);
                              image.push(objTitle);
                            }
                            } else {
                                swal("File not uploaded");
                            }//file
                      }//file
                }//for 
    
                if (event.currentTarget.files && image.length >0) {
           
                      main().then(formValues => {
                    console.log("formValues",formValues);
                    setPolicyDoc(formValues.image)
                    });
        }
    
        
      };
    
      async function main() {
        var formValues = null;
        // for (var j = 0; j < image.length; j++) {
          var config = await getConfig();
          console.log("image",image);
          console.log("config",config);
          var s3url = await s3upload(image[0]?.fileInfo, config, this);
          console.log("s3url",s3url);
          const formValue = {
            "image": s3url,
            "status": "New"
          };
          formValues = formValue;
        return Promise.resolve(formValues);
      }
    
      function s3upload(image, configuration) {
        console.log("image",image);
        console.log("configuration",configuration);
        return new Promise(function (resolve, reject) {
          S3FileUpload
            .uploadFile(image, configuration)
            .then((Data) => {
                console.log("Data",Data)
              resolve(Data.location);
            })
            .catch((error) => {
              console.log("error",error);
            })
        })
      }
    
    
    
      function getConfig() {
        return new Promise(function (resolve, reject) {
          axios
                  .post('/api/projectsettings/getS3Details/S3')
                  .then((response) => {
                    const config = {
                      bucketName: response.data.bucket,
                      // dirName: response.data.dir,
                      region: response.data.region,
                      accessKeyId: response.data.key,
                      secretAccessKey: response.data.secret,
                    }
                    resolve(config);
                  })
                  .catch(function (error) {
                  })
    
        })
      }
    }

    console.log("policy_summary",policy_summary);
    console.log("policy_summary",policy_category);
    console.log("errors",errors);

    return (
    <div className="w-full  ">
      <div className='p-7 text-xl font-semibold'>
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            {/* <span className='text-left'>Add Employee</span> */}
                <form  onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 mb-6 md:grid-cols-1">
                        <div>
                            <label for="policy_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Policy name</label>
                            <input type="text" id="policy_name"  {...register("policy_name")} value={policy_name} onChange={(e)=>{setPolicyName(e.target.value);clearErrors("policy_name")}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Policy Name..."  />
                            {errors?.policy_name && <span className="text-sm font-medium text-red-500">{errors.policy_name.message}</span>}
                        </div>
                        <div >
                            <label for="policy_category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
                            <select id="policy_category" {...register("policy_category")} value={policy_category} onChange={(e)=>{setPolicyCategory(e.target.value);clearErrors('policy_category')}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option disabled value="" selected>Select Category</option>
                                    <option value="Leave policy">Leave Policy</option>
                                    <option value="Payroll policy">Payroll Policy</option>
                            </select>
                            {errors?.policy_category && <span className="text-sm font-medium text-red-500">{errors.policy_category.message}</span>}
                        </div> 

                        <CKEditor
                                editor={ ClassicEditor }
                                data={policy_summary}
                                id="policy_summary" 
                                {...register("policy_summary")}
                                onReady={ editor => {
                                    // You can store the "editor" and use when it is needed.
                                    console.log( 'Editor is ready to use!', editor );
                                } }
                                onChange={ ( event,editor ) => {
                                    const data = editor.getData();
                                    setPolicySummary(data);
                                    clearErrors("policy_summary");
                                } }
                                onBlur={ ( event, editor ) => {} }
                                onFocus={ ( event, editor ) => {} }
                            />
                            {errors?.policy_summary && <span className="text-sm font-medium text-red-500">{errors.policy_summary.message}</span>}
                    </div>
                    <div>
                    <div >
                        <Label htmlFor="policy_doc" value="Upload file" />
                    </div>
                        <FileInput id="policy_doc"  {...register("policy_doc")} helperText="Only pdf format." onChange={handleImageChange} />
                        {errors?.policy_doc && <span className="text-sm font-medium text-red-500">{errors.policy_doc.message}</span>}
                    </div>
                   {policy_doc!=='' &&<div className='mt-6'>
                      <embed src={policy_doc} type="application/pdf"/>
                    </div>  }
                    <div className='mt-6 flex justify-end'>
                      <button type="submit" className="mt-6 text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                      </div>
                </form>
        </div>
        </div>

    </div>
  );
}

export default AddPolicy;
