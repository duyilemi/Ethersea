# Ethersea

A marketplace for non-fungible-token. Create, buy, sell, and manage NFTs on the blockchain.Every NFT has a name, description and image associated with it. The name and description are stored on the blockchain directly while the images themselves are stored on IPFS and the reference to those images are stored on the blockchain.

# Overview of the protocol:

It contains two contracts, NFT.sol and NftMarket.sol. The Nft.sol contract contains function that enables users with their address to mint NFTs, assign ID and tokenURI to it. It's base contract is the ERC721URIStorage-A ERC721 token with storage based token URI management.
The NftMarket.sol contract inherits from the ReentrancyGuard to make the nonReentrant modifier available, which are applied to functions to make sure there are no nested (reentrant) calls to them. It contains functions that can be called to put up nft, get price of nfts, buy nfts. 

# Overview of the user interface

# Home
![Screenshot (1264)](https://user-images.githubusercontent.com/67197664/165944276-ec146810-3f21-4f5f-b1ae-3f9f5f416d7d.png)

# Create
![Screenshot (1265)](https://user-images.githubusercontent.com/67197664/165944313-6b809d47-b5e3-4c42-b95c-e0f885af3ce1.png)

# My Listed Items
![Screenshot (1266)](https://user-images.githubusercontent.com/67197664/165944332-531f094d-451c-461b-9d4e-68db2b114756.png)

# My Purchases
![Screenshot (1267)](https://user-images.githubusercontent.com/67197664/165944356-efc7be15-8a06-44e2-8d66-55893842daa7.png)

# Tools and Tech Stack

React - front end framework

Solidity - ethereum smart contract language

HardHat - development framework

Web3 - library that interacts with ethereum nodes

JavaScript - handle front end logic and testing smart contracts

IPFS - decentralized file storage system

Infura - connection to IPFS and ethereum networks

Open Zeppelin - smart contract libraries and test helpers
