// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCounter;

    constructor() ERC721("CHARLIE", "CIE") {

    }

    function mintNFT(string memory _tokenURI) external returns(uint) {
        tokenCounter++;
        // mint NFT for an address...and give it an id
        _safeMint(msg.sender, tokenCounter);
        // assign a url to the NFT ...
        _setTokenURI(tokenCounter, _tokenURI);
        return(tokenCounter); 
    }
}