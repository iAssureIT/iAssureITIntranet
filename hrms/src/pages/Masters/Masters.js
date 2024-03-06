import React from "react";
import AddDepartment from "./AddDepartment";
import AddDesignation from "./AddDesignation";
import LeaveMaster from "./AddLeaves";
import AddOrgLevel from "./AddOrgLevel";


const Tabs = ({ color }) => {
  const [openTab, setOpenTab] = React.useState(1);

  const masterList = [
    {
      'title' : 'Department',
      'master' : <AddDepartment/>
    },
    {
      'title' : 'Organisation Levels',
      'master' : <AddOrgLevel/>
    },
    {
      'title' : 'Designation',
      'master' : <AddDesignation/>
    },
    {
      'title' : 'Leave Master',
      'master' : <LeaveMaster/>
    },
  ] 
  return (
    <>
     <div className='p-7   h-screen'>
      <div className='grid  grid-cols bg-grey-200 mb-8 '>
            <span className='text-xl  text-left'>MASTER</span>
        </div>
        <div className="w-full grid  grid-cols-5 gap-3 p-4">
          <ul
            className=" mb-0 list-none  flex-wrap pt-3 pb-4 flex-row"
            role="tablist"
          >
            {masterList && masterList.length > 0&&
            masterList.map((item,i)=>{
              return(
                <li className="">
                <a
                  className={
                    "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                    (openTab === i+1
                      ? "text-white bg-site"
                      : "text-site bg-white")
                  }
                  onClick={e => {
                    e.preventDefault();
                    setOpenTab(i+1);
                  }}
                  data-toggle="tab"
                  href={"#link"+(i+1)}
                  role="tablist"
                >
                  {item.title}
                </a>
              </li>
              )            
            })
        }
          </ul>
          <div className="relative flex flex-col col-span-4 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="px-4 py-5 flex-auto">
              <div className="tab-content tab-space">
              {masterList && masterList.length > 0&&
            masterList.map((item,i)=>{
              console.log("item",item);
              return(
                <div className={openTab === i+1 ? "block" : "hidden"} id={"link"+(i+1)}>
                    {item?.master}
                </div>
                 )            
               })
              }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Masters() {
  return (
    <>
       <Tabs color="site" />;
    </>
  );
}