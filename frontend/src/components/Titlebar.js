import "./Titlebar.css";
import { BsFillPlusCircleFill } from "react-icons/bs";

export default function TitleBar() {
  return (
    <>
      <div className="titlebar_top">
           <div className="titlebar_top_col1">
                             
                      <div className="titlebar_bagIcon_Products" > Tasks</div>
                      <div className="titlebar_bagIcon_Active" >Active</div>
                        <div className="titlebar_bagIcon_Draft"> Draft</div>
                      <div className="titlebar_bagIcon_Assembly">All</div> 
                      </div>
                <div className="titlebar_top_col2">
            
                       <div className="titlebar_top_col22">
                        <BsFillPlusCircleFill className="titlebar_plusIcon" />
                      <label>Add Lead</label>
                    </div>
               </div>
               
      </div>
      <div className="titlebar_underline" >____</div>
    </>
  );
}