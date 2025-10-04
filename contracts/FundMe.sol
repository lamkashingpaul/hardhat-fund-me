// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "./PriceConverter.sol";

error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Paul Lam
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address private immutable i_owner;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        uint256 usdSent = msg.value.getConversionRate(s_priceFeed);
        require(usdSent >= MINIMUM_USD, "You need to spend more ETH!");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    /**
     * @notice This function withdraws all the funds from this contract
     * @dev This implements price feeds as our library
     */
    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            s_addressToAmountFunded[s_funders[i]] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Failed to call");
    }

    /**
     * @notice This function is a cheaper version of withdraw
     * @dev This implements price feeds as our library
     */
    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            s_addressToAmountFunded[funders[i]] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Failed to call");
    }

    /**
     * @notice This function gets the owner of the contract
     * @dev This implements price feeds as our library
     */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    /**
     * @notice This function gets a funder by index
     * @dev This implements price feeds as our library
     */
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    /**
     * @notice This function gets the amount funded by an address
     * @dev This implements price feeds as our library
     */
    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    /**
     * @notice This function gets the price feed
     * @dev This implements price feeds as our library
     */
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
