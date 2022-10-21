import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Array from "./Array";
import Model from "./Model";


export default function Navigation() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/Array" element={<Array/>}></Route>
          <Route path="/Model" element={<Model/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}