const { expect, util } = require("chai");
const { utils, Signer } = require("ethers");
const { ethers, upgrades } = require("hardhat");

describe("Deployer", function() {
    it("should deploy", async function() {
        const Claim = await ethers.getContractFactory("Claim");
        const Vesting = await ethers.getContractFactory("Vesting");
        const Token = await ethers.getContractFactory("DAOToken"); 
        let accounts = await hre.ethers.getSigners();
        let initToken = 1000;
        let owner = accounts[0];
        const token = await Token.deploy(initToken, owner.address);
        
        const vest = await Vesting.deploy(token.address);

        const claim = await Claim.deploy(token.address, vest.address);

        let balance = await token.balanceOf(owner.address);

        await token.transfer(vest.address, 500);

        await vest.setVestingSchedule(owner.address, 100, true, 1, 1);

        let ownerVest = await vest.getVesting(owner.address, 0);

        console.log(ownerVest)

    })    

    it("should allow owner to claim 1 token", async function() {
        const Claim = await ethers.getContractFactory("Claim");
        const Vesting = await ethers.getContractFactory("Vesting");
        const Token = await ethers.getContractFactory("DAOToken"); 
        let accounts = await hre.ethers.getSigners();
        let initToken = 1000000;
        let owner = accounts[0];
        const token = await Token.deploy(initToken, owner.address);
        
        const vest = await Vesting.deploy(token.address);

        const claim = await Claim.deploy(token.address, vest.address);
        
        await token.transfer(claim.address, ethers.utils.parseEther("100000"));

        let balance = await token.balanceOf(claim.address);

        let ownerBalance = await token.balanceOf(owner.address);


        console.log(ethers.utils.formatEther(balance.toString()));

        console.log(ethers.utils.formatEther(ownerBalance.toString()));

        

        await claim.claimTokens();

        let vesting = await  vest.getVesting(owner.address, 0)

        balance = await token.balanceOf(owner.address);
        console.log(balance.toString())

        console.log(vesting.toString());


    });

    it("should not allow token to be claimed twice", async function() {
        const Claim = await ethers.getContractFactory("Claim");
        const Vesting = await ethers.getContractFactory("Vesting");
        const Token = await ethers.getContractFactory("DAOToken"); 
        let accounts = await hre.ethers.getSigners();
        let initToken = 1000000;
        let owner = accounts[0];
        const token = await Token.deploy(initToken, owner.address);
        
        const vest = await Vesting.deploy(token.address);

        const claim = await Claim.deploy(token.address, vest.address);
        
        await token.transfer(claim.address, ethers.utils.parseEther("100000"));

        let balance = await token.balanceOf(claim.address);

        let ownerBalance = await token.balanceOf(owner.address);


        console.log(ethers.utils.formatEther(balance.toString()));

        console.log(ethers.utils.formatEther(ownerBalance.toString()));

        
        try {
            await claim.claimTokens();
            await claim.claimTokens();                        
        } catch(err) {
            console.log(err)

        }
    })

    it("Should let someone who is not the owner claim token", async function() {
         const Claim = await ethers.getContractFactory("Claim");
        const Vesting = await ethers.getContractFactory("Vesting");
        const Token = await ethers.getContractFactory("DAOToken"); 
        let accounts = await hre.ethers.getSigners();
        let initToken = 1000000;
        let owner = accounts[0];
        let user1 = accounts[1];
        const token = await Token.deploy(initToken, owner.address);
        
        const vest = await Vesting.deploy(token.address);

        const claim = await Claim.deploy(token.address, vest.address);
        
        await token.transfer(claim.address, ethers.utils.parseEther("100000"));

        let balance = await token.balanceOf(claim.address);

        let ownerBalance = await token.balanceOf(owner.address);

        await claim.connect(user1).claimTokens();

        let vesting = await  vest.getVesting(user1.address, 0)

        balance = await token.balanceOf(user1.address);
        console.log(ethers.utils.formatEther(balance.toString()));

        console.log(vesting.toString());


    })

    it("Should allow user to claim tokens from vesting contract", async function() {
        const Claim = await ethers.getContractFactory("Claim");
        const Vesting = await ethers.getContractFactory("Vesting");
        const Token = await ethers.getContractFactory("DAOToken"); 
        let accounts = await hre.ethers.getSigners();
        let initToken = 1000000;
        let owner = accounts[0];
        let user1 = accounts[1];
        const token = await Token.deploy(initToken, owner.address);
        
        const vest = await Vesting.deploy(token.address);

        const claim = await Claim.deploy(token.address, vest.address);
        
        await token.transfer(claim.address, ethers.utils.parseEther("100000"));

        let balance = await token.balanceOf(claim.address);

        let ownerBalance = await token.balanceOf(owner.address);

        await claim.connect(user1).claimTokens();

        let sevenDays = 7 * 24 * 60 * 60;

        await ethers.provider.send("evm_increaseTime", [sevenDays]);
        await ethers.provider.send("evm_mine")


        await vest.connect(user1).claim(0);

        ownerBalance = await token.balanceOf(user1.address);

        console.log(ethers.utils.formatEther(ownerBalance.toString()))


    })
})
