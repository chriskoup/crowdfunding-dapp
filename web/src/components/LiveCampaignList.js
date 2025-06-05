import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "../CrowdfundingABI.json";

const CONTRACT_ADDRESS = "0x65e19dd31283dEb0F316181FF8df189ffF8b3C25";

const LiveCampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [status, setStatus] = useState("");
  const [sharesToBuy, setSharesToBuy] = useState({});

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
        setContract(contractInstance);

        const ids = await contractInstance.methods.getActiveCampaigns().call();
        const campaignDetails = await Promise.all(
          ids.map(async (id) => {
            const c = await contractInstance.methods.campaigns(id).call();
            const shares = await contractInstance.methods.getBackerShares(id, accounts[0]).call();
            return { ...c, shares, id };
          })
        );

        setCampaigns(campaignDetails);
      }
    };

    init();
  }, []);

  const pledge = async (id, pledgeCost) => {
    try {
      const shares = sharesToBuy[id];
      if (!shares || shares <= 0) return;
      const amount = BigInt(pledgeCost) * BigInt(shares);

      setStatus("Προσθήκη pledge...");
      await contract.methods.pledgeCampaign(id, shares).send({
        from: account,
        value: amount.toString(),
      });
      setStatus("✅ Επιτυχία!");
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Ενεργές Καμπάνιες</h2>
      {campaigns.length === 0 && <p>Δεν υπάρχουν ενεργές καμπάνιες.</p>}

      {campaigns.map((c) => (
        <div key={c.id} className="border p-4 rounded mb-4 bg-white shadow">
          <p><strong>Τίτλος:</strong> {c.title}</p>
          <p><strong>Δημιουργός:</strong> {c.entrepreneur}</p>
          <p><strong>Τιμή μετοχής:</strong> {c.pledgeCost} Wei</p>
          <p><strong>Μετοχές:</strong> {c.pledgesCount} / {c.pledgesNeeded}</p>
          <p><strong>Δικές σου μετοχές:</strong> {c.shares}</p>

          <input
            type="number"
            placeholder="Πλήθος μετοχών"
            onChange={(e) => setSharesToBuy({ ...sharesToBuy, [c.id]: e.target.value })}
            className="border p-2 rounded mt-2 w-full"
          />

          <button
            onClick={() => pledge(c.id, c.pledgeCost)}
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded hover:bg-green-700"
          >
            Υποστήριξε
          </button>
        </div>
      ))}

      {status && <p className="italic text-sm mt-4">{status}</p>}
    </div>
  );
};

export default LiveCampaignList;
