import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const CancelledCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
        setContract(contractInstance);

        const ids = await contractInstance.methods.getCancelledCampaigns().call();
        const campaignDetails = await Promise.all(
          ids.map(async (id) => {
            const c = await contractInstance.methods.campaigns(id).call();
            return { ...c, id };
          })
        );

        setCampaigns(campaignDetails);
      }
    };

    init();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Ακυρωμένες Καμπάνιες</h2>
      {campaigns.length === 0 ? (
        <p>Καμία ακυρωμένη καμπάνια.</p>
      ) : (
        campaigns.map((c) => (
          <div key={c.id} className="border p-4 rounded mb-4 bg-red-50">
            <p><strong>Τίτλος:</strong> {c.title}</p>
            <p><strong>Δημιουργός:</strong> {c.entrepreneur}</p>
            <p><strong>Τιμή Μετοχής:</strong> {c.pledgeCost} Wei</p>
            <p><strong>Ακυρωμένες Μετοχές:</strong> {c.pledgesCount} / {c.pledgesNeeded}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default CancelledCampaigns;
