// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarket is ReentrancyGuard {
    address payable public immutable feeAccount; // account that receives a commission when an NFT is sold
    uint public immutable feePercent; // Percentage of commission
    uint public itemCount;


    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    struct Item{
        uint ItemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }
    // create event, a means of logging data onto blockchain ...
    // "indexed" will make it possible to search for Offered events using associated variables as filters
    event Offered (
        uint ItemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event ItemBought (
        uint ItemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    // ItemId to Item mapping 
    mapping(uint => Item) public items;

    function putUpItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price cant be this small");
        // increment item...it represents ItemId
        itemCount++;
        // transfer nft to nftmarket contract...
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // build new Item using function params and call struct like a function
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        // emit event
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function getTotalPrice(uint _ItemId) view public returns(uint) {
        return(items[_ItemId].price*(100 + feePercent)/100);
    }

    function buyItem(uint _ItemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_ItemId);
        // attaching the mapping to a variable
        Item storage item = items[_ItemId];
        require(_ItemId > 0 && _ItemId <= itemCount, "Such Item does not exist");
        require(msg.value >= _totalPrice, "You dont have enough ether to cover item price and market commission");
        require(!item.sold, "Item not available");
        // pay the seller
        item.seller.transfer(item.price);
        // pay the market commission 
        feeAccount.transfer(_totalPrice - item.price);
        // update item to sold
        item.sold = true;
        // transfer nft from market address to buyer address
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit ItemBought(
            _ItemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

}