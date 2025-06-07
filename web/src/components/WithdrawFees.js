import React, { useState } from "react";
import contractInstance from "../web3";

const WithdrawFees = ({ account }) => {
  const [status, setStatus] = useState("");

  const handleWithdraw = async () => {
    try {
      setStatus("Ανάληψη σε εξέλιξη...");
      await contractInstance.methods.withdrawFees().send({ from: account });
      setStatus("✅ Επιτυχής ανάληψη προμηθειών!");
    } catch (err) {
      setStatus("❌ Σφάλμα: " + err.message);
    }
  };

  return (
    <div>
      <h2>Ανάληψη Προμηθειών</h2>
      <button onClick={handleWithdraw}>Ανάληψη</button>
      <p>{status}</p>
    </div>
  );
};

export default WithdrawFees;
