// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

interface IERC20 {

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ICO is ReentrancyGuard{
    address public admin; // Address of the contract administrator
    IERC20 public immutable tokenContract; // Instance of the token contract
    IERC20 public immutable USDC;
    bool public saleOpen; // Flag to track if the sale is open
    bool public isActive = true;

    bytes32 public merkleRoot;

    // Sale Config var
    uint256 public saleStartTime;
    uint256 public saleEndTime;
    uint256 public tokenPrice; // Price of each token in wei

    AggregatorV3Interface constant ETHChainLinkAggregator =
        AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    AggregatorV3Interface constant USDCChainLinkAggregator = 
        AggregatorV3Interface(0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E);

    struct TokenInfo {
        uint256 tokenSoldInPrivateSale;
        uint256 tokenSoldInPublicSale;
        uint256 tokenTransferToCommunity;
        uint256 totalTotalSold;
    }

    TokenInfo private tokenInfo;
    mapping(address => bool) public isBlacklisted; // mapping to check blacklisted- user

    SaleType public currentSaleType;
    enum SaleType {saleNotActive, Private, Public }
    enum BuyType { ETH, USDC } // Buying options

    event ConfigSale(
        SaleType saleType,
        uint256 startTime,
        uint256 endTime,
        uint256 tokenPrice
    );

    event Sell(address indexed _buyer, uint256 _amount);
    event BuyToken(address indexed user, uint256 dollarAmount, uint256 estimateAmount, uint256 userTokenAmounts, SaleType currentSaleType);
    event ResetSale();
    
    // Constructor to initialize the contract
    constructor(address usdc, address _tokenContract) {
        admin = msg.sender;
        tokenContract = IERC20(_tokenContract);
        USDC = IERC20(usdc);
        saleOpen = false;
    }

    // Modifier to restrict function access to the contract administrator
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier nonZero(uint256 amount) {
        require(amount >= 1 ," Invalid input amount");
        _;
    }
    modifier notPaused() {
        require(isActive, "Sale is paused.");
        _;
    }
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Not valid address");
        _;
    }
    modifier checkSaleStatus() {
        require(block.timestamp > saleStartTime && saleEndTime > block.timestamp, "Sale not started or sale is ended");
        _;
    }

    modifier isWhitelisted(bytes32[] calldata merkleProof) {
        require(verifyWhitelist(merkleProof), "User not Whitelisted!!");
        _;
    }

    modifier onlyEoA(address _account) {
        require(!isContract(_account), "Contract Address");
        _;
    }

    modifier checkBlacklist(address user) {
        require(!isBlacklisted[user], "User is blacklisted");
        _;
    } 

    // function to start sale
    function configSale(
        uint256 startTime,
        uint256 endTime,
        SaleType saleType,
        uint256 _tokenPrice
    ) external onlyAdmin nonZero(_tokenPrice) returns (bool) {
        require(
            startTime > block.timestamp && endTime > startTime,
            "Invalid sale time"
        );
        require(
            saleType == SaleType.Private || saleType == SaleType.Public,
            "invalid sale type"
        );
        require(_tokenPrice > 0, "invalid token price");
        saleStartTime = startTime;
        saleEndTime = endTime;
        currentSaleType = saleType;
        tokenPrice = _tokenPrice;
        saleOpen = true;
        emit ConfigSale(saleType, startTime, endTime, _tokenPrice);
        return true;
    }

    /// @notice To reset the sale if owner pass wrong data while configuring the sale turn off pubic sale
    function resetSale() external onlyAdmin {      
        currentSaleType = SaleType.saleNotActive;
        saleStartTime = 0;
        saleEndTime = 0;
        tokenPrice = 0;
        saleStartTime = 0;
        saleEndTime = 0;
        saleOpen = false;
        emit ResetSale();
    }

    // function to buy token with eth
    function buyTokenPrivate(uint256 amount, BuyType buyType ,bytes32[] calldata merkleProof) external payable notPaused() nonZero(amount) checkSaleStatus() nonReentrant() isWhitelisted(merkleProof) onlyEoA(msg.sender) checkBlacklist(msg.sender) returns(bool){
        require(currentSaleType == SaleType.Private, "Invalid Sale!!!");
        (uint256 estimatedAmount, uint256 tokenAmount) = getEstimateFund(amount, buyType); 
        tokenAmount = tokenAmount *10**18;
        if (buyType == BuyType.ETH) {
            require(estimatedAmount == msg.value, "Invalid amount passed");
            Address.sendValue(payable(admin), estimatedAmount); // transferring eth value to admin 
            require(tokenContract.transferFrom(admin, msg.sender, tokenAmount));
            tokenInfo.tokenSoldInPrivateSale += tokenAmount;
        } else {
            require(USDC.allowance(msg.sender, address(this)) >= estimatedAmount,"Insufficient allowance");
            require(USDC.transferFrom(msg.sender, admin, estimatedAmount), "Failed to Transfer USDC");
            require(tokenContract.transferFrom(admin, msg.sender, tokenAmount), "Failed to Transfer token");
            tokenInfo.tokenSoldInPrivateSale += tokenAmount;
        }
        emit BuyToken(msg.sender, amount, estimatedAmount, tokenAmount, currentSaleType);
        return true;
    }

    // function to buy token with eth
    function buyTokenPublic(uint256 amount, BuyType buyType) external payable notPaused() nonZero(amount) checkSaleStatus() nonReentrant() onlyEoA(msg.sender) checkBlacklist(msg.sender) returns(bool){
        require(currentSaleType == SaleType.Public, "Invalid Sale!!!");
        (uint256 estimatedAmount, uint256 tokenAmount) = getEstimateFund(amount, buyType); 
        tokenAmount = tokenAmount *10**18;
        if (buyType == BuyType.ETH) {
            require(estimatedAmount == msg.value, "Invalid amount passed");
            Address.sendValue(payable(admin), estimatedAmount); // transferring eth value to admin 
            require(tokenContract.transferFrom(admin, msg.sender, tokenAmount));
            tokenInfo.tokenSoldInPublicSale += tokenAmount;
        } else {
            require(USDC.allowance(msg.sender, address(this)) >= estimatedAmount,"Insufficient allowance");
            require(USDC.transferFrom(msg.sender, admin, estimatedAmount), "Failed to Transfer USDC");
            require(tokenContract.transferFrom(admin, msg.sender, tokenAmount), "Failed to Transfer token");
            tokenInfo.tokenSoldInPublicSale += tokenAmount;
        }
        emit BuyToken(msg.sender, amount, estimatedAmount, tokenAmount, currentSaleType);
        return true;
    }

    function transferToCommunity(address[] memory users, uint256 tokenAmount) external onlyAdmin {
        for(uint i; i<users.length; i++) {
            require(tokenContract.transferFrom(admin, users[i], tokenAmount), "Failed to Transfer token");
            tokenInfo.tokenTransferToCommunity += tokenAmount;
        }
    }

    // Function to get the latest eth price
    function getNativePrice() public view returns (int256) {
        (, int256 price, , , ) = ETHChainLinkAggregator.latestRoundData();
        return price;
    }
    
    // Function To calculate the estimate fund 
    function getEstimateFund(uint256 amount, BuyType buyType)
        public
        view
        nonZero(amount)
        returns (uint256, uint256)
    {
        uint256 decimal = 10**18;
        if (buyType == BuyType.ETH) {
            int256 currentPrice = getNativePrice() * 10**10;
            uint256 dollarAmount = amount * decimal * decimal;
            uint256 ethInDollar = (dollarAmount) / uint256(currentPrice);
            uint256 tokenAmount = (amount * decimal) / tokenPrice;
            return (ethInDollar, tokenAmount);
        } else {
            uint8 usdcDecimal = USDC.decimals();
            uint256 usdcAmount = amount * (10**usdcDecimal);
            uint256 tokenAmount = (amount * decimal) / tokenPrice;
            return (usdcAmount, tokenAmount);
        }
    }

    // get Token Info
    function getTotalTokenSold() external view returns(uint256 totalSold, uint256 tokenInPrivateSale, uint256 tokenInPublicSale) {
        uint256 total = tokenInfo.tokenSoldInPrivateSale + tokenInfo.tokenSoldInPublicSale + tokenInfo.tokenTransferToCommunity;
        return (total, tokenInfo.tokenSoldInPrivateSale, tokenInfo.tokenSoldInPublicSale);
    }

    // set merkle root
    function setMerkleRoot(bytes32 root) external onlyAdmin() {
        merkleRoot = root;
    }

    // whitelisting address using merkle tree
    function verifyWhitelist(bytes32[] calldata merkleProof) public view returns(bool){
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    // Add user to blacklist
    function blacklistUser(address[] memory users) external onlyAdmin {
        for (uint256 i; i < users.length; i++) {
            isBlacklisted[users[i]] = true;
        }
    }

    // Remove user from blacklist
    function removeBlacklist(address user) external onlyAdmin validAddress(user){
        require(isBlacklisted[user], "User is not Blacklisted");
        isBlacklisted[user] = false;
    }

    // function to check if address is contract or eoa
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}
