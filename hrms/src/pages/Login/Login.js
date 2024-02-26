import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faGlobe,faUserShield,faUser, faThumbsUp,faUsers,faCalendarDay,faClipboardUser,faApartment} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { Card } from '@material-tailwind/react';
import {useNavigate} from 'react-router-dom';
import { useForm, SubmitHandler } from "react-hook-form";
import axios from 'axios';
import swal from 'sweetalert';


function Login() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

    const navigate = useNavigate();
    const onSubmit = (data) => {
        console.log("data",data);
        var auth = {
            email: data.email,
            password: data.password,
            role: ["admin","user"]
          }
            axios.post('/api/auth/post/login', auth)
              .then((response) => {
               console.log("response",response)
               if (response.data.message === "Login Auth Successful") {
                var userDetails = {
                  firstName: response.data.userDetails.firstName,
                  lastName: response.data.userDetails.lastName,
                  email: response.data.userDetails.email,
                  phone: response.data.userDetails.phone,
                  companyID : parseInt(response.data.userDetails.companyID),
                  pincode: response.data.userDetails.pincode,
                  user_id: response.data.userDetails.user_id,
                  roles: response.data.userDetails.roles,
                  token: response.data.userDetails.token,
                  approvalStatus : response.data.approvalStatus
                }
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user_ID", response.data.userDetails.user_id);
                localStorage.setItem("roles", response.data.roles);
                localStorage.setItem("loggedIn", true);
                localStorage.setItem("companyID", response.data.userDetails.companyID);
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                navigate('/dashboard');
                window.location.reload();
              } else if (response.data.message === "USER_BLOCK") {
                swal({
                  text: "You are blocked by admin. Please contact Admin."
                });
              } else if (response.data.message === "NOT_REGISTER") {
                swal({
                  text: "This Email ID is not registered. Please try again."
                });
              } else if (response.data.message === "INVALID_PASSWORD" || response.data.message ==="INVALID_PASSWORD_ERROR_IN_WRONGPWDATTEMPT" ) {
                swal({
                  text: "You have entered wrong password. Please try again."
                });
              } else if (response.data.message === "USER_UNVERIFIED") {
                swal({
                  text: "You have not verified your account. Please verify your account."
                })
                  .then((value) => {
                    var emailText = {
                      "emailSubject": "Email Verification",
                      "emailContent": "As part of our registration process, we screen every new profile to ensure its credibility by validating email provided by user. While screening the profile, we verify that details put in by user are correct and genuine.",
                    }
                    axios.patch('/api/auth/patch/setsendemailotpusingEmail/' + this.refs.loginusername.value, emailText)
                      .then((response) => {
                        swal("We send you a Verification Code to your registered email. Please verify your account.");
                        this.props.history.push("/confirm-otp/" + response.data.userID);
                      })
                      .catch((error) => {
                        swal(" Failed to sent OTP");
                      })
                  });
                // document.getElementById("logInBtn").value = 'Sign In';
              }
      
              })
              .catch((error) => {
                console.log("error", error);
              
              });

        // localStorage.setItem('loggedIn',true);
        // navigate('/dashboard');
        // window.location.reload()
    };

  return (
    <div className="w-full App ">
        <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
         <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-32 h-24 mr-2" src="/images/iAssureIT_Logo.png" alt="logo"/>
        </a> 
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                      <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input type="email"  {...register("email",{required:true,pattern:/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/})}   name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required=""/>
                  </div>
                  <div>
                      <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type="password" {...register("password",{required:true})}  name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                      {errors.exampleRequired && <span>This field is required</span>}
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                          </div>
                          <div className="ml-3 text-sm">
                            <label for="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                          </div>
                      </div>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                  </div>
                  {/* <input type="submit" /> */}
                  {/* <button type="submit" onClick={()=>{}} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button> */}
                  <button type="submit"  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
              </form>
          </div>
      </div>
  </div>
</section>

    </div>
  );
}

export default Login;
