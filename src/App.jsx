// import { useState } from 'react'

import {BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar"; 
import Moneysnapshot from "./pages/moneySnapshot"; 
import strategyTracks from "./pages/strategyTracks"; 
import KnowYourMoney from "./pages/knowYourney";
import Learn from "./pages/learn";
import "./App.css";

export default function App() {
   return (
     <BrowserRouter>
      <div className="app-container">
       <Sidebar />
       <div className="main-content">
         <Routes>
           <Route path="/" element={<Login/>} />
           <Route path="/Tracks" element={<StrategyTracks />} />
           <Route path="/Simulation" element={<KnowYourMoney />} />
            <Route path="/Snapshot" element={<Moneysnapshot />} />
            <Route path="/Learn" element={<Learn />} />
            <Route path="/Profile" element={<Profile />} />
         </Routes>
       </div>
      </div>
</BrowserRouter>
) ;
}