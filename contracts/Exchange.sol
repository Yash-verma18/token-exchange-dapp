// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    // tokenAddress ->   userAddress  -> tokensDeposited
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

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
}
