import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

// ⚠️ Βάλε εδώ τη διεύθυνση του συμβολαίου σου
const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const HeaderInfo = () => {
  const [account, setAccount] = useState("");
  const [owner, setOwner] = useState("");
  const [contractBalance, setContractBalance] = useState("0");
  const [feesCollected, setFeesCollected] = useState("0");

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
        setContract(contractInstance);

        const ownerAddress = await contractInstance.methods.owner().call();
        setOwner(ownerAddress);

        const balanceWei = await web3Instance.eth.getBalance(CONTRACT_ADDRESS);
        setContractBalance(web3Instance.utils.fromWei(balanceWei, "ether"));

        const fees = await contractInstance.methods.getFeesCollected().call();
        setFeesCollected(web3Instance.utils.fromWei(fees, "ether"));

        // Αυτόματη ενημέρωση σε αλλαγή λογαριασμού
        window.ethereum.on("accountsChanged", (accs) => {
          setAccount(accs[0]);
        });
      } else {
        alert("Το Metamask δεν είναι εγκατεστημένο!");
      }
    };

    init();
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-xl shadow-md text-sm">
      <h2 className="text-xl font-bold mb-2">Πληροφορίες Συμβολαίου</h2>
      <p><strong>Συνδεδεμένος Λογαριασμός:</strong> {account}</p>
      <p><strong>Ιδιοκτήτης Συμβολαίου:</strong> {owner}</p>
      <p><strong>Υπόλοιπο Συμβολαίου:</strong> {contractBalance} ETH</p>
      <p><strong>Συγκεντρωμένα Fees:</strong> {feesCollected} ETH</p>
    </div>
  );
};

export default HeaderInfo;
