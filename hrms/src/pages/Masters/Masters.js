import React from "react";
import AddDepartment from "./AddDepartment";
import AddDesignation from "./AddDesignation";
const Tabs = ({ color }) => {
  const [openTab, setOpenTab] = React.useState(1);
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
            <li className="">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 1
                    ? "text-white bg-site"
                    : "text-site bg-white")
                }
                onClick={e => {
                  e.preventDefault();
                  setOpenTab(1);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                Department
              </a>
            </li>
            <li className="">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 2
                    ? "text-white bg-site"
                    : "text-site bg-white")
                }
                onClick={e => {
                  e.preventDefault();
                  setOpenTab(2);
                }}
                data-toggle="tab"
                href="#link2"
                role="tablist"
              >
                 Designation
              </a>
            </li>
          
          </ul>
          <div className="relative flex flex-col col-span-4 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="px-4 py-5 flex-auto">
              <div className="tab-content tab-space">
                <div className={openTab === 1 ? "block" : "hidden"} id="link1">
                 <AddDepartment/>
                </div>
                <div className={openTab === 2 ? "block" : "hidden"} id="link2">
                    <AddDesignation/>
                </div>
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