pragma solidity ^0.4.18;

contract DeadDrop{
    string message;
    function DeadDrop (string data) public {
        message = data;
    }
    
    function getMessage() constant public returns (string)
    {
        return message;
    }
}