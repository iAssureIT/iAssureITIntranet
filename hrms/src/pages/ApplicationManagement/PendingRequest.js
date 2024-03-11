import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function PendingRequest(props) {
    const [leaveReqData, setLeaveRequestData] = useState();
    const [status, setStatus] = useState(null);
    useEffect(() => {
        axios.get('/api/leaveApplication/get/pending-request/Pending')
            .then(res => {
                console.log("res==========================", res.data);
                setLeaveRequestData(res.data.data)
            })
            .catch(err => {
                console.log("err", err);
            })
    }, [props]);

    const handleApprove = (event) => {
        const id = event.target.id;
        var formValues = {
            status: 'approved',
        };

        axios.patch('/api/leaveApplication/update/status/' + id, formValues)
            .then(res => {
                const updatedData = leaveReqData.map(item => {
                    if (item.id === id) {
                        return { ...item, status: 'approved' };
                    }
                    return item;
                });
                setLeaveRequestData(updatedData);
            })
            .catch(err => {
                console.log("err", err);
            });
    };

    const handleReject = (event) => {
        const id = event.target.id;
        var formValues = {
            status: 'rejected'
        };
        axios.patch('/api/leaveApplication/update/status/' + id, formValues)
            .then(res => {
                const updatedData = leaveReqData.map(item => {
                    if (item.id === id) {
                        return { ...item, status: 'rejected' };
                    }
                    return item;
                });
                setLeaveRequestData(updatedData);
            })
            .catch(err => {
                console.log("err", err);
            });
    };
    return (
        <div className='w-full App p-4 h-screen'>
            {console.log("leaveReqData 21", leaveReqData)}
            <div className='text-xl font-semibold mb-8 '>Pending Request</div>
            {
                leaveReqData?.map((data, key) => {
                    return (
                        <div id={key} className='bg-white p-4'>
                            <div className='text-right'>
                                Date: {moment(data?.createdAt).format("MMM Do YY")}</div>
                            <div>From: Sarika Ghanwat</div>
                            <div className='text-black'><span className='font-bold'> Subject : </span>{data?.leaveSubject}</div>
                            <div dangerouslySetInnerHTML={{ __html: data?.leaveSummary }}></div>
                            <div>{data?.status}</div>
                            <div className=''>
                                <button className='bg-green-500 p-2 rounded-lg text-white font-bold' onClick={handleApprove} id={data._id}>Approve</button>
                                <button className='bg-red-600 p-2 rounded-lg  text-white font-bold' onClick={handleReject} id={data._id}>Reject</button>
                            </div>
                        </div>
                    )
                })
            }


        </div>
    )
}
export default PendingRequest;