import React, { useEffect, useState } from 'react'
import LeftBar from './components/Leftbar'
import TitleBar from './components/Titlebar'
import Topbar from './components/Topbar'
import './salesDashboard.css'
import SalesDash from './components/Msale'

import axios from 'axios'
export default function SalesDashboard() {
 
  const [todo, setTodo]=useState([])
  const [inProgress, setInProgress]=useState([])
  const [completed, setCompleted]=useState([])
  ///
  useEffect(()=>{
    const url = "http://localhost:3000/dev/getTODO";
    const data = {}
    const header = {}
    axios.post(url, data, {headers:header})
    .then((res)=>{
      let temp= res.data; 
      console.log(res.data)
      let tempTodo=[];
      let tempInProgress=[];
      let tempCompleted=[];

      for(const iterator of temp) {
          if(iterator.txtProgresstype==="To Do"){
            iterator.isclicked=false;
            tempTodo.push(iterator)
            
          }else if(iterator.txtProgresstype==="In Progress"){
            iterator.isclicked=false;
            tempInProgress.push(iterator)
            // for(const x of tempInProgress){
            //   x.isClicked = false
            // }
          }
           else{
            iterator.isclicked=false;
            tempCompleted.push(iterator)
            // for(const x of tempCompleted){
            //   x.isClicked = false
            // }
          }
      }
      setTodo(tempTodo)
      setInProgress(tempInProgress)
      setCompleted(tempCompleted)
      console.log("tempTodo=>"+JSON.stringify(tempTodo))
    })
    .catch((err)=>{
      console.log(err)
    })
  },[]);
  return (
    <div className='salesdash_outer'>
      <Topbar />
      <div className='salesdash_content'>
        <LeftBar />
        <div className='salesdash_content_right'>
            <div className='salesdash_content_right_inside'>
            <TitleBar />
            <SalesDash todo={todo} inprogress={inProgress} completed={completed} setTodo={setTodo} setInProgress={setInProgress} setCompleted={setCompleted} />
            </div>
        </div>
      </div>
    </div>
  )
}
