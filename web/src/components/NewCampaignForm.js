import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const NewCampaignForm = () => {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [needed, setNeeded] = useState("");
  const [status, setStatus] = useState("");

  const createCampaign = async () => {
    if (!title || !cost || !needed) {
      setStatus("Συμπλήρωσε όλα τα πεδία.");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("Metamask δεν είναι διαθέσιμο.");

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

      setStatus("Δημιουργία καμπάνιας...");

      await contract.methods.createCampaign(title, cost, needed).send({
        from: accounts[0],
        value: web3.utils.toWei("0.02", "ether"),
      });

      setStatus("✅ Επιτυχής δημιουργία καμπάνιας!");
      setTitle("");
      setCost("");
      setNeeded("");
    } catch (err) {
      setStatus(`❌ Σφάλμα: ${err.message}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-2">Δημιουργία Νέας Καμπάνιας</h2>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Τίτλος"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>
      <div className="mb-2">
        <input
          type="number"
          placeholder="Τιμή Μετοχής (σε Wei)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>
      <div className="mb-2">
        <input
          type="number"
          placeholder="Απαιτούμενες Μετοχές"
          value={needed}
          onChange={(e) => setNeeded(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>
      <button
        onClick={createCampaign}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Δημιουργία
      </button>
      {status && <p className="mt-3 text-sm italic">{status}</p>}
    </div>
  );
};

export default NewCampaignForm;
