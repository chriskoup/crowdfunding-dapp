import React, { useState } from "react";
import HeaderInfo from "./components/HeaderInfo";
import NewCampaignForm from "./components/NewCampaignForm";
import LiveCampaignList from "./components/LiveCampaignList";
import CompletedCampaigns from "./components/CompletedCampaigns";
import CancelledCampaigns from "./components/CancelledCampaigns";
import RefundPanel from "./components/RefundPanel";
import OwnerActions from "./components/OwnerActions";
import CampaignDetails from "./components/CampaignDetails";

const Home = ({ account }) =>  {
  const [view, setView] = useState("active");

  return (
    <div className="max-w-4xl mx-auto p-4">
      <HeaderInfo />

      <div className="flex flex-wrap gap-2 my-4">
        <button onClick={() => setView("active")} className="bg-blue-500 text-white px-3 py-1 rounded">Ενεργές</button>
        <button onClick={() => setView("create")} className="bg-green-500 text-white px-3 py-1 rounded">Δημιουργία</button>
        <button onClick={() => setView("completed")} className="bg-gray-500 text-white px-3 py-1 rounded">Ολοκληρωμένες</button>
        <button onClick={() => setView("cancelled")} className="bg-red-500 text-white px-3 py-1 rounded">Ακυρωμένες</button>
        <button onClick={() => setView("refund")} className="bg-yellow-500 text-white px-3 py-1 rounded">Αποζημίωση</button>
        <button onClick={() => setView("owner")} className="bg-purple-500 text-white px-3 py-1 rounded">Διαχείριση</button>
        <button onClick={() => setView("details")} className="bg-slate-600 text-white px-3 py-1 rounded">Αναζήτηση</button>
      </div>

      {view === "active" && <LiveCampaignList />}
      {view === "create" && <NewCampaignForm />}
      {view === "completed" && <CompletedCampaigns />}
      {view === "cancelled" && <CancelledCampaigns />}
      {view === "refund" && <RefundPanel />}
      {view === "owner" && (
  <div className="space-y-4">
    <OwnerActions />
    <WithdrawFees account={account} />
  </div>
)}
      {view === "details" && <CampaignDetails />}
    </div>
  );
};

export default Home;
