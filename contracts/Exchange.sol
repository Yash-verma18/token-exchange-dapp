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
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );
     event Withdraw(
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

    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
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
        orderCount ++;
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

    function cancelOrder (uint256 _id) public {
        // Fetch the order
        _Order storage _order = orders[_id];

        require(_order.id == _id, "Order does not exist");

        // Must be my order
        require(msg.sender == _order.user, "Not your order");

        // Mark the order as cancelled
        orderCancelled[_id] = true;

        // Emit the event
        emit Cancel(_id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
    }


    // Executing Orders
    function fillOrder (uint256 _id) public {
        // 1. Must be valid orderId
        require(_id > 0 && _id <= orderCount, "Order does not exist");
        // 2. Order can't be filled
        require(!orderFilled[_id], "Order already filled");
        // 3. Order can't be cancelled
        require(!orderCancelled[_id], "Order already cancelled");
        
        // Fetch the order
        _Order storage _order = orders[_id];

        // Execute the order
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
        
        // Mark order as filled
        orderFilled[_order.id] = true;
    }
         

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // Fee is paid by the user who filled the order (msg.sender)
        // Fee is deducted from _amountGet
        uint256 _feeAmount = (_amountGet * feePercent) / 100;
        
        // Execute the trade
        // msg.sender is the user who filled the order, while _user is who created the order
        // Updating the exchange table with the trade for both users for "get" token

        tokens[_tokenGet][msg.sender] =
            tokens[_tokenGet][msg.sender] - 
            (_amountGet + _feeAmount);
        
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

        // Charge fees
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

        // Updating the exchange table with the trade for both users for "give" token
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;

         // Emit trade event
        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
         
    }

}