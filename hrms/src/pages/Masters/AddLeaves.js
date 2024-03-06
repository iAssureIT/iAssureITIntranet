import { useState,useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { Card,Typography ,Tooltip,IconButton} from '@material-tailwind/react';


const TABLE_HEAD = ["Leave Type",  "Leave Count"];

const TABLE_BODY = [
    {

        type: 'Casual Leave',
        count : '0'
    },
    {
        type: 'Sick Leave',
        count : '0'
    },
    {
        type: 'Previledged Leave',
        count : '0'
    },
  ]

  
  

const AddLeaves=()=> {
    const [user,setUser] = useState('');
  const [leaveData, setLeaveData] = useState(TABLE_BODY);
  const formValues ={
    casualLeave               : 0,
    priviledgedLeave          : 0,
    sickLeave                 : 0,
};

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      useEffect(() => {
        var user =  JSON.parse(localStorage.getItem('userDetails'));
        console.log("user",user);
        setUser(user);
        getLeaveCount();
      },[]);

      

      const getLeaveCount=()=>{
        axios.get('/api/leaveMaster/getLeaveCount')
        .then(res=>{
            console.log("getLeaveCount",res);
            for (let index = 0; index < leaveData.length; index++) {
                if(leaveData[index].type === "Casual Leave"){
                    leaveData[index].count = res?.data?.casualLeave;
                }else if(leaveData[index].type === "Sick Leave"){
                    leaveData[index].count = res?.data?.sickLeave;
                }else if(leaveData[index].type === "Previledged Leave"){
                    leaveData[index].count = res?.data?.priviledgedLeave;
                }
            }
        })
        .catch(err=>{
            console.log("err",err);
        })
      }

    const onChangeInput = (e, type) => {
        const { name, value } = e.target;
        console.log("e.target",e.target);
        console.log('name', name)
        console.log('value',  e.target.value)
        console.log('type', type)
        console.log("leaveData",leaveData);
        const editData = leaveData.map((item) =>
          item.type === type && name ? { ...item, [name]: value } : item
        )
        setLeaveData(editData)
      
        for (let index = 0; index < editData.length; index++) {
            if(editData[index].type === "Casual Leave"){
                formValues.casualLeave = editData[index].count;
            }else if(editData[index].type === "Sick Leave"){
                formValues.sickLeave = editData[index].count;
            }else if(editData[index].type === "Previledged Leave"){
                formValues.priviledgedLeave = editData[index].count;
            }
        }
        console.log("formValues",formValues);
        axios.post('/api/leaveMaster/post',formValues)
        .then(res=>{
            console.log("res",res);
        })
        .catch(err=>{
            console.log("err",err);
        })
      }

  return (
    <div className="w-full  ">
      
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
                    {leaveData.map(({ type,count }, index) => {
                    const isLast = index === leaveData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={index}>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            {type}
                            </Typography>
                        </td>
                       
                    <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                            <input
                                name="count"
                                value={count}
                                type="number"
                                onChange={(e) => onChangeInput(e, type)}
                                placeholder="Type Name"
                            />
                            </Typography>
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

export default AddLeaves;