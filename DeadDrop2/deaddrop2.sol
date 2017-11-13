pragma solidity ^0.4.18;
//the above lines specify the lowest version of the compiler that can be used..
//a dead-drop is a thing or situation where you can leave somebody a message..
//comments are preceded with a double slash

//this new version allows the contract creator to collect fees for changing the message
//when the contract is created they can now specify a minimum increase in the previous fee to initiate a change
//the creator must stake some initial amount...

//all contracts have the line below, that specifies the contract name
//like a Class in Object Oriented Programming
contract DeadDrop{
    string message; //a variable that stores the message 
    uint minPercentIncrease; //how many percent must the new bid exceed the old..
    address owner;//a variable to remember who owns the contract 
    uint oldBalance = 0;
    //events are a way for the user interface to listen for the results of smart contract transactions
    event MessageChanged(address sender, uint price, string mesg);
    event ChangeFailed(address sender, uint price);
    //this function has the same name as the contract and is called when the contract is created
    //now this constructor function has been marked payable,
    //which means that it can receive more than 0 eth in a transaction (safety feature)
    //the new argument minPct is the minimum bid over the current price
    function DeadDrop (string data, uint minPct) public payable { //public means anybody can use it
        message = data; // store the provided data as the message
        //msg.sender is a special variable that has the address of the account that called this function
        //msg.sender is automatically set by the solidity contract framework when just before begins
        owner = msg.sender;
        minPercentIncrease = minPct;
        oldBalance = this.balance;//this.balance is a special variable holding the balance (wei) of the contract 
    }
    //this function returns the message
    //constant means it doesn't modify any data in the contract, and therefore doesn't cost gas
    //as the ethereum client is expected to read the data from the local blockchain database
    function getMessage() constant public returns (string)
    {
        return message;
    }
    
    function getMinPrice() public constant returns (uint){
        return (uint) ( (minPercentIncrease/100.0 + 1.0) * oldBalance );
        //notice we can do floating point math, just not store floating point variables (or return values)
    }
    //returns true if change is scucessful
    function setNewMessage(string newMsg) public payable
    {
        //msg.value is a special variable that holds the number of wei sent with the transaction (gas is counted separately)
        if(msg.value > getMinPrice()){
            message = newMsg;
            oldBalance = this.balance;
            MessageChanged(msg.sender, msg.value,  message);

        }else{
            ChangeFailed(msg.sender, msg.value);
        }
    }
    
    //the way this is coded, should only be called by the owner, no need for UI
    function withdraw() public payable{
        if (msg.sender != owner) throw;// punish abusive caller by burning their gas down
        owner.send(this.balance);
    }
    
    
    
}