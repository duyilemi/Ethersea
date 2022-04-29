import logo from "./logo.png";
import "./App.css";

import { ethers } from "ethers";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NftMarketAddress from "../contractsData/NftMarket-address.json";
import NftMarketAbi from "../contractsData/NftMarket.json";
import NFTAddress from "../contractsData/NFT-address.json";
import NFTAbi from "../contractsData/NFT.json";
import Navigation from "./Navbar";
import { Spinner } from "react-bootstrap";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListedItems";
import MyPurchases from "./MyPurchases";

function App() {
  const [account, setAccount] = useState(null);
  const [nft, setNft] = useState({});
  const [nftmarket, setNftmarket] = useState({});
  const [loading, setLoading] = useState(true);
  // MetaMask Connect/Login
  const web3Handler = async () => {
    // Access Accounts From MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    // Access Provider From MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    // Get copies of deployed contracts
    const nftmarket = new ethers.Contract(
      NftMarketAddress.address,
      NftMarketAbi.abi,
      signer
    );
    setNftmarket(nftmarket);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNft(nft);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        <div>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
              }}
            >
              <Spinner animation="border" style={{ display: "flex" }} />
              <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<Home nftmarket={nftmarket} nft={nft} />}
              />
              <Route
                path="/create"
                element={<Create nftmarket={nftmarket} nft={nft} />}
              />
              <Route
                path="/my-listed-items"
                element={
                  <MyListedItems
                    nftmarket={nftmarket}
                    nft={nft}
                    account={account}
                  />
                }
              />
              <Route
                path="/my-purchases"
                element={
                  <MyPurchases
                    nftmarket={nftmarket}
                    nft={nft}
                    account={account}
                  />
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
