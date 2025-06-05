import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const RefundPanel = () => {
  const [status, setStatus] = useState("");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
      }
    };
    init();
  }, []);

  const claimRefund = async (campaignId) => {
    try {
      setStatus("Αίτημα αποζημίωσης...");
      await contract.methods.claimRefund(campaignId).send({ from: account });
      setStatus("✅ Αποζημιώθηκες για την καμπάνια " + campaignId);
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  return (
    <div className="mt-6 p-4 bg-yellow-50 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Αποζημίωση από Ακυρωμένες Καμπάνιες</h2>
      <p className="text-sm mb-2">Καταχώρησε το ID της καμπάνιας που ακυρώθηκε για να ζητήσεις επιστροφή χρημάτων.</p>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="ID Καμπάνιας"
          onChange={(e) => setStatus(parseInt(e.target.value))}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => claimRefund(status)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Ζήτα Αποζημίωση
        </button>
      </div>
      {status && typeof status === "string" && (
        <p className="mt-2 italic text-sm">{status}</p>
      )}
    </div>
  );
};

export default RefundPanel;
