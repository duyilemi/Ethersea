const { expect } = require("chai");

const toWei = (value) => ethers.utils.parseEther(value.toString());
const toEther = (value) => ethers.utils.formatEther(value);

describe("NftMarket", function () {
  let deployer, addrss1, addrss2, addrss, nft, nftmarket;
  let feePercent = 1;
  let URI = "My URI";
  beforeEach(async () => {
    // access contract factory
    const NFT = await ethers.getContractFactory("NFT");
    const NftMarket = await ethers.getContractFactory("NftMarket");
    // access accounts/signers ...
    [deployer, addrss1, addrss2, ...addrss] = await ethers.getSigners();
    //  deploy contracts ...
    nft = await NFT.deploy();
    nftmarket = await NftMarket.deploy(feePercent);
  });
  describe("Deployment", () => {
    it("Expect to track name and symbol of NFT contract", async () => {
      let name = await nft.name();
      let symbol = await nft.symbol();
      expect(name).to.equal("CHARLIE");
      expect(symbol).to.equal("CIE");
    });
    it("Expect to track feeAccount and feePercent of NftMarket contract", async () => {
      let feeAccount = await nftmarket.feeAccount();
      let feePercent = await nftmarket.feePercent();
      expect(feeAccount).to.equal(deployer.address);
      expect(feePercent).to.equal(feePercent);
    });
  });
  describe("Minting NFTs", () => {
    it("Expect to mint NFT and assign URI", async () => {
      // testing on address 1
      await nft.connect(addrss1).mintNFT(URI);
      expect(await nft.tokenCounter()).to.equal(1);
      expect(await nft.balanceOf(addrss1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      // testing on address 2
      await nft.connect(addrss2).mintNFT(URI);
      expect(await nft.tokenCounter()).to.equal(2);
      expect(await nft.balanceOf(addrss2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });
  describe("put up NFT", () => {
    beforeEach(async () => {
      //   connect and mint NFT for address 1
      await nft.connect(addrss1).mintNFT(URI);
      // addrss1 approve NftMarket contract to spend nft
      await nft.connect(addrss1).setApprovalForAll(nftmarket.address, true);
    });
    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async () => {
      await expect(
        nftmarket.connect(addrss1).putUpItem(nft.address, 1, toWei(1))
      )
        .to.emit(nftmarket, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addrss1.address);
      //   nftmarket should be the owner of nft now ...
      expect(await nft.ownerOf(1)).to.equal(nftmarket.address);
      // Number of item should be one now ...
      expect(await nftmarket.itemCount()).to.equal(1);
      // Access items from mapping and verify if fields are correct
      const item = await nftmarket.items(1);
      expect(await item.ItemId).to.equal(1);
      expect(await item.nft).to.equal(nft.address);
      expect(await item.tokenId).to.equal(1);
      expect(await item.price).to.equal(toWei(1));
      expect(await item.sold).to.equal(false);
    });
    it("Should fail if price is zero", async () => {
      await expect(
        nftmarket.connect(addrss1).putUpItem(nft.address, 1, toWei(0))
      ).to.be.revertedWith("Price cant be this small");
    });
  });

  describe("Buying Items on Market", () => {
    let totalPriceInWei;
    let price = 3;
    let fee = (feePercent / 100) * price;
    beforeEach(async () => {
      //   connect and mint NFT for address 1
      await nft.connect(addrss1).mintNFT(URI);
      // addrss1 approve NftMarket contract to spend nft
      await nft.connect(addrss1).setApprovalForAll(nftmarket.address, true);
      // addrss1 put up item on the market
      await nftmarket.connect(addrss1).putUpItem(nft.address, 1, toWei(price));
    });
    it("Should pay seller, charge fees, transfer NFT to buyer, update item as sold and emit a Bought event", async () => {
      const sellerInitialEthBalance = await addrss1.getBalance();
      const feeAccountInitialEthBalance = await deployer.getBalance();
      // access the total price
      totalPriceInWei = await nftmarket.getTotalPrice(1);
      // adrress 2 buys item on the market
      await expect(
        nftmarket.connect(addrss2).buyItem(1, { value: totalPriceInWei })
      )
        .to.emit(nftmarket, "ItemBought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addrss1.address,
          addrss2.address
        );
      const sellerFinalEthBalance = await addrss1.getBalance();
      const feeAccountFinalEthBalance = await deployer.getBalance();
      // Sold item should be marked sold
      expect((await nftmarket.items(1)).sold).to.equal(true);
      // Seller should be payed for item sold
      expect(+toEther(sellerFinalEthBalance)).to.equal(
        +price + +toEther(sellerInitialEthBalance)
      );
      // feeAccount should recieve commission
      expect(+toEther(feeAccountFinalEthBalance)).to.equal(
        +fee + +toEther(feeAccountInitialEthBalance)
      );
      expect(await nft.ownerOf(1)).to.equal(addrss2.address);
    });
    it("Should fail for invalid item Ids, buying sold items and when not enough ether is paid", async () => {
      // fails for invalid item Ids
      await expect(
        nftmarket.connect(addrss2).buyItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("Such Item does not exist");
      await expect(
        nftmarket.connect(addrss2).buyItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("Such Item does not exist");
      // Fails when not enough ether is paid with the transaction.
      // In this instance, fails when buyer only sends enough ether to cover the price of the nft
      // not the additional market fee.
      await expect(
        nftmarket.connect(addrss2).buyItem(1, { value: toWei(price) })
      ).to.be.revertedWith(
        "You dont have enough ether to cover item price and market commission"
      );
      // Fails when trying to buy already sold item ...
      // address 2  buys item 1
      await nftmarket.connect(addrss2).buyItem(1, { value: totalPriceInWei });
      // address 3
      const addrss3 = addrss[0];
      await expect(
        nftmarket.connect(addrss3).buyItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("Item not available");
    });
  });
});
