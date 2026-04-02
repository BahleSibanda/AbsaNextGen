import React from "react";
import { useState } from "react"; /* pulls in React's built -in tool for tracking changing values, like which nav item is selected*/
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const spendingData = [
    {name: "Rent/ bond", value: 12000, colour: ABSA_RED},
    {name: "Car Payments", value: 6500, colour: "#5DCAA5"},
    { name: "Living costs", value: 8000, color: "#EF9F27" },
    { name: "Student loan", value: 2500, color: "#B4B2A9" },
    { name: "Savings", value: 8800, color: "#0f1923" },
];

const goals = [
  { name: "Emergency fund", current: 18000, target: 24000, color: "#1D9E75" },
  { name: "Property deposit", current: 32000, target: 200000, color: ABSA_RED },
  { name: "Investment portfolio", current: 20000, target: 100000, color: "#378ADD" },
];

const insights = [
  { text: "Savings rate is 15% — slightly below the recommended 20% for your income level.", color: ABSA_RED },
  { text: "Car expenses are 28% of take-home pay. Paying it down faster frees up R2 000/month.", color: "#EF9F27" },
  { text: "No revolving credit card debt — strong foundation for your credit score.", color: "#1D9E75" },
  { text: "On track for a property deposit by Year 3 at your current savings rate.", color: "#378ADD" },
];


const nudges = [
  { type: "success", iconColor: "#1D9E75", text: "Emergency fund is 75% complete! Keep adding R2 000/month to finish in 3 months." },
  { type: "warn", iconColor: "#EF9F27", text: "Savings rate dropped below 20% this month. Consider redirecting R500 from entertainment." },
  { type: "info", iconColor: "#378ADD", text: "You have been on the Property Builder track for 2 months — review your deposit milestone." },
];
 



export default function MoneySnapshot() {
    return (
        <div>
            <h1>Money Snapshot</h1>
        </div>
    );
}


