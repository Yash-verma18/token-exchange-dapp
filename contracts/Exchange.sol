// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // tokenAddress ->   userAddress  -> tokensDeposited
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;

    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

     
    // A way to model the order
    struct _Order {
        uint256 id; // Unique ID
        address user; // User who created the order
        address tokenGet; // Token they want to get
        uint256 amountGet; // How much they want to get
        address tokenGive; // Token they want to give 
        uint256 amountGive; // How much they want to give
        uint256 timestamp; // When the order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit & Withdraw Tokens
    function depositToken(address _token, uint256 _amount) public {
        // Transfer Token to this contract which is called exchange.
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        // Update Balances
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit the event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Withdraw Tokens
    function withdrawToken(address _token, uint256 _amount) public {
        // Check if user has enough tokens || this is NECESSITY | SO IT SHOULD BE ALWAYS RETURN TRUE
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");

        // Transfer Tokens
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Token transfer failed"
        );

        // Update Balances
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        // Emit the event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check Balances
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // Make & cancel orders
    function makeOrder (
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive, 
        uint256 _amountGive
        ) public {
     
        // Require token balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive, "Insufficient balance");
    
        // Create Order
        orderCount = orderCount + 1;
        orders[orderCount] =  _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // Emit the event
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }
}