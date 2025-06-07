import { useState, useEffect } from "react";
import Web3 from "web3";
import Home from "./Home";

function App() {
  const [account, setAccount] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }
      }
    };
    loadAccount();
  }, []);

  return <Home account={account} />;
}

export default App;
