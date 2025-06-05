import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

// Εξάγουμε και το Web3 για πρόσβαση σε web3.utils
export { web3, Web3 };
export default web3;
