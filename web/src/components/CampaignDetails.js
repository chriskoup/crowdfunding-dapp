import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const CampaignDetails = () => {
  const [campaignId, setCampaignId] = useState("");
  const [details, setDetails] = useState(null);
  const [shares, setShares] = useState(0);
  const [status, setStatus] = useState("");

  const fetchDetails = async () => {
    try {
      if (!window.ethereum) throw new Error("Metamask δεν είναι διαθέσιμο.");

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

      const c = await contract.methods.campaigns(campaignId).call();
      const s = await contract.methods.getBackerShares(campaignId, accounts[0]).call();

      setDetails(c);
      setShares(s);
      setStatus("");
    } catch (err) {
      setDetails(null);
      setShares(0);
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  return (
    <div className="mt-6 p-4 bg-slate-50 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Λεπτομέρειες Καμπάνιας</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="ID Καμπάνιας"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={fetchDetails}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Αναζήτηση
        </button>
      </div>

      {status && <p className="italic text-sm mb-2 text-red-500">{status}</p>}

      {details && (
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Τίτλος:</strong> {details.title}</p>
          <p><strong>Δημιουργός:</strong> {details.entrepreneur}</p>
          <p><strong>Τιμή Μετοχής:</strong> {details.pledgeCost} Wei</p>
          <p><strong>Μετοχές:</strong> {details.pledgesCount} / {details.pledgesNeeded}</p>
          <p><strong>Fulfilled:</strong> {details.fulfilled ? "Ναι" : "Όχι"}</p>
          <p><strong>Cancelled:</strong> {details.cancelled ? "Ναι" : "Όχι"}</p>
          <p><strong>Οι δικές σου μετοχές:</strong> {shares}</p>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
