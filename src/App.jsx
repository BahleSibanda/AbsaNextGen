// import { useState } from 'react'

import {BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import OnboardingQuiz from "./pages/onboarding";
import Profile from "./pages/profile";
import Sidebar from "./components/sidebar"; 
import Moneysnapshot from "./pages/moneySnapshot"; 
import StrategyTracks from "./pages/strategyTracks";
import KnowYourMoney from "./pages/knowyourMoney";
import Learn from "./pages/learn";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/Snapshot" element={<Moneysnapshot />} />
          <Route path="/Tracks" element={<StrategyTracks />} />
          <Route path="/Simulation" element={<KnowYourMoney />} />
          <Route path="/Learn" element={<Learn />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
   return (
     <BrowserRouter>
     <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Onboard" element={<OnboardingQuiz />} />
     </Routes>
      <div className="app-container">
       <Sidebar />
       <div className="main-content">
         <Routes>
           <Route path="/Tracks" element={<StrategyTracks />} />
           <Route path="/Simulation" element={<KnowYourMoney />} />
            <Route path="/Snapshot" element={<Moneysnapshot />} />
            <Route path="/Learn" element={<Learn />} />
            <Route path="/Profile" element={<Profile />} />
         </Routes>
       </div>
      </div>
</BrowserRouter>
);
}