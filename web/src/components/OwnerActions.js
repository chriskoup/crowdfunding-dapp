import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const OwnerActions = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [status, setStatus] = useState("");
  const [banAddress, setBanAddress] = useState("");

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

  const withdraw = async () => {
    try {
      setStatus("Ανάληψη κρατήσεων...");
      await contract.methods.withdrawOwnerFunds().send({ from: account });
      setStatus("✅ Ολοκληρώθηκε η ανάληψη.");
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  const banEntrepreneur = async () => {
    try {
      setStatus("Δήλωση ως κακόβουλου...");
      await contract.methods.banEntrepreneur(banAddress).send({ from: account });
      setStatus("✅ Το address αποκλείστηκε.");
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  const destroyContract = async () => {
    try {
      await contract.methods.confirmDestruction().send({ from: account });
      await contract.methods.destroyContract().send({ from: account });
      setStatus("✅ Το συμβόλαιο απενεργοποιήθηκε.");
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  return (
    <div className="mt-6 p-4 bg-purple-50 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Ενέργειες Διαχειριστή</h2>

      <button
        onClick={withdraw}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-2"
      >
        Ανάληψη Κρατήσεων
      </button>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Διεύθυνση προς ban"
          onChange={(e) => setBanAddress(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={banEntrepreneur}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-2"
        >
          Αποκλεισμός Επιχειρηματία
        </button>
      </div>

      <button
        onClick={destroyContract}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Καταστροφή Συμβολαίου
      </button>

      {status && <p className="mt-2 italic text-sm">{status}</p>}
    </div>
  );
};

export default OwnerActions;
