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

// import StepperWithContent from "./StepIndicator";

// import Joi from 'joi';


function OnBoardingForm(){
const navigate = useNavigate();
const [user,setUser]=useState();
const [open,setOpen] = useState(true);
const [firstName,setFirstName] =useState('');
const [middleName,setMiddleName] =useState('');
const [lastName,setLastName] =useState('');
const [personal_email,setPersonalEmail] =useState('');
const [personal_mobile,setContactNo] =useState('');
const [dob,setDOB] =useState('');
const [maritalStatus,setMaritalStatus] =useState('');
const [nationality,setNationality] =useState('');
const [aadharCardNo,setAadharCardNo] =useState('');
const [pan_card_no,setPanCardNo] =useState('');
const [addressLine1,setAddressLine1] =useState('');
const [city,setCity] =useState('');
const [state,setState] =useState('');
const [country,setCountry] =useState('');
const [pincode,setPincode] =useState('');
const [alternate_no,setAlternateNo] =useState('');
const [blood_group,setBloodGroup] =useState('');
const [person_id,setPersonId] =useState('');

const [activeStep, setActiveStep] = React.useState(0);
  const [isLastStep, setIsLastStep] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(false);
 
  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);
 

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
  getEmployeeDetails(user.user_id);
},[1]);


const getEmployeeDetails=(user_id)=>{
    axios.get('api/personmaster/get/details/'+user_id)
  .then((res)=>{
    if(res?.data){
        console.log("res",res);
        setPersonId(res.data._id)
        setFirstName(res.data.firstName);
        setMiddleName(res.data.middleName)
        setLastName(res.data.lastName);
        setDOB(res.data.DOB)
        setPersonalEmail(res.data.personalEmail);
        setContactNo(res.data.contactNo);
        setMaritalStatus(res.data.maritalStatus)
        setNationality(res.data.nationality);
        setAadharCardNo(res.data.adhaarCardNo);
        setPanCardNo(res.data.panCardNo);
        setAlternateNo(res.data.altContactNo);
        setBloodGroup(res.data.bloodGroup)
    }
   
  })
  .catch(err=>{
    console.log("err",err);
  })
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
            "firstName": data.firstName,
            "middleName": data.middleName,
            "lastName": data.lastName,
            "dob": data.dob, 
            "gender":data.gender,
            "maritalStatus":data.maritalStatus,
            "nationality":data.nationality,
            "aadharCardNo": (data.aadhar_card_no).replaceAll('-', ''),
            "panCardNo": data.pan_card_no, 
            "addressLine1":data.addressLine1,
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
                text: res.data.message
            });
            // navigate to another screen where user able to filled info with unverified status
        })
        .catch((err)=>console.log("err",err)) // on error show error msg and form should be reset
    }   
console.log("errors",errors);
  return(
    <>
        
    <div className="w-full">
      <div className='p-7 text-xl font-semibold'>
      <div className='text-center'>Fill below details</div>
       {/* <StepperWithContent />  */}
        <div className='grid  grid-cols bg-grey-200 mb-8'>
            
            <span className='text-left'> Employee Details :</span>
                <form className='bg-blue-200 my-6  p-4' onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 md:grid-cols-3 mb-6  rounded">
                        <div>
                            <label for="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name<span className="text-red-500">*</span></label>
                            <input type="text" id="firstName" value={firstName}  {...register("firstName",{required:true,})} onChange={e=>setFirstName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Firstname" required />
                            {/* {errors.firstName && <span className="text-sm font-medium text-red-500">First Name is required</span>} */}
                        </div>
                        <div>
                            <label for="middleName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Middle Name<span className="text-red-500">*</span></label>
                            <input type="text" id="middleName"  value={middleName}  {...register("middleName",{required:true})} onChange={(e)=>setMiddleName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Middlename" required />
                            {/* {errors.middleName && <span className="text-sm font-medium text-red-500">Middle Name is required</span>} */}
                        </div>
                        <div>
                            <label for="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name<span className="text-red-500">*</span></label>
                            <input type="text" id="lastName" value={lastName}  {...register("lastName",{required:true})} onChange={(e)=>setLastName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Lastname" required/>
                            {/* {errors.lastName && <span className="text-sm font-medium text-red-500">Last Name is required</span>} */}
                        </div>
                        <div >
                            <label for="dob" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date Of Birth<span className="text-red-500">*</span></label>
                            <input type="date" id="dob"  value={new Date(dob)   } {...register("dob",{required:true})} onChange={(e)=>setDOB(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                            {/* {errors.dob && <span className="text-sm font-medium text-red-500">Select Date Of Birth</span>} */}
                        </div>
                        <div className="mt-4">
                        <span className="text-gray-700">Gender</span>
                            <div id="gender" {...register("gender", { required: true })}  className="mt-2">
                                <label className="inline-flex items-center">
                                <input type="radio" className="form-radio" name="male" value="male" />
                                <span className="ml-2">Male</span>
                                </label>
                                <label className="inline-flex items-center ml-6">
                                <input type="radio" className="form-radio" name="Female" value="Female" />
                                <span className="ml-2">Female</span>
                                </label>
                            </div>
                        </div> 
                        <div >
                            <label for="maritalStatus" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Marital Status<span className="text-red-500">*</span></label>
                            <select id="maritalStatus" value={maritalStatus} {...register("maritalStatus", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value="" disabled selected>Select Marital Status</option>
                                <option value="Married">Married</option>
                                <option value="Single">Single</option>
                                <option value="Divorce">Divorce</option>
                            </select>
                            {errors.maritalStatus && <span className="text-sm font-medium text-red-500">Marital Status is required</span>}
                        </div>  
                        <div >
                            <label for="nationality" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Noationality<span className="text-red-500">*</span></label>
                            <select id="nationality" value={nationality} {...register("nationality", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option value="" disabled selected>Select Nationality</option>
                                <option value="afghan">Afghan</option>
                                <option value="albanian">Albanian</option>
                                <option value="algerian">Algerian</option>
                                <option value="american">American</option>
                                <option value="andorran">Andorran</option>
                                <option value="angolan">Angolan</option>
                                <option value="antiguans">Antiguans</option>
                                <option value="argentinean">Argentinean</option>
                                <option value="armenian">Armenian</option>
                                <option value="australian">Australian</option>
                                <option value="austrian">Austrian</option>
                                <option value="azerbaijani">Azerbaijani</option>
                                <option value="bahamian">Bahamian</option>
                                <option value="bahraini">Bahraini</option>
                                <option value="bangladeshi">Bangladeshi</option>
                                <option value="barbadian">Barbadian</option>
                                <option value="barbudans">Barbudans</option>
                                <option value="batswana">Batswana</option>
                                <option value="belarusian">Belarusian</option>
                                <option value="belgian">Belgian</option>
                                <option value="belizean">Belizean</option>
                                <option value="beninese">Beninese</option>
                                <option value="bhutanese">Bhutanese</option>
                                <option value="bolivian">Bolivian</option>
                                <option value="bosnian">Bosnian</option>
                                <option value="brazilian">Brazilian</option>
                                <option value="british">British</option>
                                <option value="bruneian">Bruneian</option>
                                <option value="bulgarian">Bulgarian</option>
                                <option value="burkinabe">Burkinabe</option>
                                <option value="burmese">Burmese</option>
                                <option value="burundian">Burundian</option>
                                <option value="cambodian">Cambodian</option>
                                <option value="cameroonian">Cameroonian</option>
                                <option value="canadian">Canadian</option>
                                <option value="cape verdean">Cape Verdean</option>
                                <option value="central african">Central African</option>
                                <option value="chadian">Chadian</option>
                                <option value="chilean">Chilean</option>
                                <option value="chinese">Chinese</option>
                                <option value="colombian">Colombian</option>
                                <option value="comoran">Comoran</option>
                                <option value="congolese">Congolese</option>
                                <option value="costa rican">Costa Rican</option>
                                <option value="croatian">Croatian</option>
                                <option value="cuban">Cuban</option>
                                <option value="cypriot">Cypriot</option>
                                <option value="czech">Czech</option>
                                <option value="danish">Danish</option>
                                <option value="djibouti">Djibouti</option>
                                <option value="dominican">Dominican</option>
                                <option value="dutch">Dutch</option>
                                <option value="east timorese">East Timorese</option>
                                <option value="ecuadorean">Ecuadorean</option>
                                <option value="egyptian">Egyptian</option>
                                <option value="emirian">Emirian</option>
                                <option value="equatorial guinean">Equatorial Guinean</option>
                                <option value="eritrean">Eritrean</option>
                                <option value="estonian">Estonian</option>
                                <option value="ethiopian">Ethiopian</option>
                                <option value="fijian">Fijian</option>
                                <option value="filipino">Filipino</option>
                                <option value="finnish">Finnish</option>
                                <option value="french">French</option>
                                <option value="gabonese">Gabonese</option>
                                <option value="gambian">Gambian</option>
                                <option value="georgian">Georgian</option>
                                <option value="german">German</option>
                                <option value="ghanaian">Ghanaian</option>
                                <option value="greek">Greek</option>
                                <option value="grenadian">Grenadian</option>
                                <option value="guatemalan">Guatemalan</option>
                                <option value="guinea-bissauan">Guinea-Bissauan</option>
                                <option value="guinean">Guinean</option>
                                <option value="guyanese">Guyanese</option>
                                <option value="haitian">Haitian</option>
                                <option value="herzegovinian">Herzegovinian</option>
                                <option value="honduran">Honduran</option>
                                <option value="hungarian">Hungarian</option>
                                <option value="icelander">Icelander</option>
                                <option value="indian">Indian</option>
                                <option value="indonesian">Indonesian</option>
                                <option value="iranian">Iranian</option>
                                <option value="iraqi">Iraqi</option>
                                <option value="irish">Irish</option>
                                <option value="israeli">Israeli</option>
                                <option value="italian">Italian</option>
                                <option value="ivorian">Ivorian</option>
                                <option value="jamaican">Jamaican</option>
                                <option value="japanese">Japanese</option>
                                <option value="jordanian">Jordanian</option>
                                <option value="kazakhstani">Kazakhstani</option>
                                <option value="kenyan">Kenyan</option>
                                <option value="kittian and nevisian">Kittian and Nevisian</option>
                                <option value="kuwaiti">Kuwaiti</option>
                                <option value="kyrgyz">Kyrgyz</option>
                                <option value="laotian">Laotian</option>
                                <option value="latvian">Latvian</option>
                                <option value="lebanese">Lebanese</option>
                                <option value="liberian">Liberian</option>
                                <option value="libyan">Libyan</option>
                                <option value="liechtensteiner">Liechtensteiner</option>
                                <option value="lithuanian">Lithuanian</option>
                                <option value="luxembourger">Luxembourger</option>
                                <option value="macedonian">Macedonian</option>
                                <option value="malagasy">Malagasy</option>
                                <option value="malawian">Malawian</option>
                                <option value="malaysian">Malaysian</option>
                                <option value="maldivan">Maldivan</option>
                                <option value="malian">Malian</option>
                                <option value="maltese">Maltese</option>
                                <option value="marshallese">Marshallese</option>
                                <option value="mauritanian">Mauritanian</option>
                                <option value="mauritian">Mauritian</option>
                                <option value="mexican">Mexican</option>
                                <option value="micronesian">Micronesian</option>
                                <option value="moldovan">Moldovan</option>
                                <option value="monacan">Monacan</option>
                                <option value="mongolian">Mongolian</option>
                                <option value="moroccan">Moroccan</option>
                                <option value="mosotho">Mosotho</option>
                                <option value="motswana">Motswana</option>
                                <option value="mozambican">Mozambican</option>
                                <option value="namibian">Namibian</option>
                                <option value="nauruan">Nauruan</option>
                                <option value="nepalese">Nepalese</option>
                                <option value="new zealander">New Zealander</option>
                                <option value="ni-vanuatu">Ni-Vanuatu</option>
                                <option value="nicaraguan">Nicaraguan</option>
                                <option value="nigerien">Nigerien</option>
                                <option value="north korean">North Korean</option>
                                <option value="northern irish">Northern Irish</option>
                                <option value="norwegian">Norwegian</option>
                                <option value="omani">Omani</option>
                                <option value="pakistani">Pakistani</option>
                                <option value="palauan">Palauan</option>
                                <option value="panamanian">Panamanian</option>
                                <option value="papua new guinean">Papua New Guinean</option>
                                <option value="paraguayan">Paraguayan</option>
                                <option value="peruvian">Peruvian</option>
                                <option value="polish">Polish</option>
                                <option value="portuguese">Portuguese</option>
                                <option value="qatari">Qatari</option>
                                <option value="romanian">Romanian</option>
                                <option value="russian">Russian</option>
                                <option value="rwandan">Rwandan</option>
                                <option value="saint lucian">Saint Lucian</option>
                                <option value="salvadoran">Salvadoran</option>
                                <option value="samoan">Samoan</option>
                                <option value="san marinese">San Marinese</option>
                                <option value="sao tomean">Sao Tomean</option>
                                <option value="saudi">Saudi</option>
                                <option value="scottish">Scottish</option>
                                <option value="senegalese">Senegalese</option>
                                <option value="serbian">Serbian</option>
                                <option value="seychellois">Seychellois</option>
                                <option value="sierra leonean">Sierra Leonean</option>
                                <option value="singaporean">Singaporean</option>
                                <option value="slovakian">Slovakian</option>
                                <option value="slovenian">Slovenian</option>
                                <option value="solomon islander">Solomon Islander</option>
                                <option value="somali">Somali</option>
                                <option value="south african">South African</option>
                                <option value="south korean">South Korean</option>
                                <option value="spanish">Spanish</option>
                                <option value="sri lankan">Sri Lankan</option>
                                <option value="sudanese">Sudanese</option>
                                <option value="surinamer">Surinamer</option>
                                <option value="swazi">Swazi</option>
                                <option value="swedish">Swedish</option>
                                <option value="swiss">Swiss</option>
                                <option value="syrian">Syrian</option>
                                <option value="taiwanese">Taiwanese</option>
                                <option value="tajik">Tajik</option>
                                <option value="tanzanian">Tanzanian</option>
                                <option value="thai">Thai</option>
                                <option value="togolese">Togolese</option>
                                <option value="tongan">Tongan</option>
                                <option value="trinidadian or tobagonian">Trinidadian or Tobagonian</option>
                                <option value="tunisian">Tunisian</option>
                                <option value="turkish">Turkish</option>
                                <option value="tuvaluan">Tuvaluan</option>
                                <option value="ugandan">Ugandan</option>
                                <option value="ukrainian">Ukrainian</option>
                                <option value="uruguayan">Uruguayan</option>
                                <option value="uzbekistani">Uzbekistani</option>
                                <option value="venezuelan">Venezuelan</option>
                                <option value="vietnamese">Vietnamese</option>
                                <option value="welsh">Welsh</option>
                                <option value="yemenite">Yemenite</option>
                                <option value="zambian">Zambian</option>
                                <option value="zimbabwean">Zimbabwean</option>
                            </select>
                            {errors.nationality && <span className="text-sm font-medium text-red-500">Marital Status is required</span>}
                        </div>  
                        <div >
                            <label for="aadhar_card_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Aadhar Card Number<span className="text-red-500">*</span></label>
                            <input type="text" id="aadhar_card_no" value={aadharCardNo} {...register("aadhar_card_no",{required:true, pattern: /^\d{4}-\d{4}-\d{4}$/ })} maxLength={14} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.aadhar_card_no && <span className="text-sm font-medium text-red-500">Please enter a valid Aadhar Card Number (XXXX-XXXX-XXXX)</span>}
                        </div> 
                        <div >
                            <label for="pan_card_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PAN Card Number<span className="text-red-500">*</span></label>
                            <input type="text" id="pan_card_no" value={pan_card_no} {...register("pan_card_no",{required:true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/ })} maxLength={10} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.pan_card_no && <span className="text-sm font-medium text-red-500">Please enter a valid PAN Card Number (ABCDE1234F)</span>}
                        </div> 
                        </div>
                        <span className='text-left'> Address :</span>
                    <div className="grid gap-6 my-6 md:grid-cols-3   rounded">
                        <div>
                            <label for="addressLine1" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Address<span className="text-red-500">*</span></label>
                            <textarea type="text" id="addressLine1" value={addressLine1} {...register("addressLine1",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"> </textarea>
                            {errors.addressLine1 && <span className="text-sm font-medium text-red-500">Current Address is required</span>}
                        </div>
                        <div>
                            <label for="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City<span className="text-red-500">*</span></label>
                            <input type="text" id="city" value={city} {...register("city",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter City" />
                            {errors.city && <span className="text-sm font-medium text-red-500">City is required</span>}
                        </div>
                        <div>
                            <label for="state" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">State<span className="text-red-500">*</span></label>
                            <input type="text" id="state" value={state}  {...register("state",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter State" />
                            {errors.state && <span className="text-sm font-medium text-red-500">State is required</span>}
                        </div>
                        <div>
                            <label for="country" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
                            <input type="text" id="country" value={country} {...register("country",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Pincode" />
                        </div> 
                        <div>
                            <label for="pincode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode</label>
                            <input type="text" id="pincode" value={pincode} {...register("pincode",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Pincode" />
                        </div>
                        </div>
                        <span className='text-left'> Contact Info :</span>
                    <div className="grid gap-6 my-6 md:grid-cols-3 rounded">
                        <div>
                            <label for="personal_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Email<span className="text-red-500">*</span></label>
                            <input type="email" id="personal_email" value={personal_email} {...register("personal_email",{required:true})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Personal Email" />
                            {errors.personal_email && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                        <div>
                            <label for="personal_mobile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Mobile<span className="text-red-500">*</span></label>
                            <input type="tel" id="personal_mobile" value={personal_mobile} {...register("personal_mobile",{required:true, pattern: /^\+?\d{10}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Mobile Number" pattern="/^+91(7\d|8\d|9\d)\d{9}$/" />
                            {errors.personal_mobile && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                        <div>
                            <label for="alternate_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alternate Number<span className="text-red-500">*</span></label>
                            <input type="tel" id="alternate_no" value={alternate_no} {...register("alternate_no",{required:true, pattern: /^\+?\d{10}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Alternate Mobile Number" pattern="/^+91(7\d|8\d|9\d)\d{9}$/" />
                            {errors.alternate_no && <span className="text-sm font-medium text-red-500">Please enter valid data</span>}
                        </div>
                      
                       
                        {/* <div >
                            <label for="passport_no" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Passport Number<span className="text-red-500">*</span></label>
                            <input type="text" id="passport_no" {...register("passport_no",{required:true, pattern: /^[A-Z0-9]{7,}$/})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            {errors.passport_no && <span className="text-sm font-medium text-red-500">Please enter a valid Passport Number</span>}
                        </div>  */}
                        <div >
                            <label for="blood_group" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Blood Group<span className="text-red-500">*</span></label>
                            <select id="blood_group" value={blood_group} {...register("blood_group", { required: true })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
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
                        <button type="submit" className="text-white bg-blue-700  mr-4 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next</button>
                        <button type="button" onClick={() => reset()} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Reset</button>
                        
                    </div>
                </form>
        </div>
        </div>

    </div>
    </>
)}    


export default OnBoardingForm;  