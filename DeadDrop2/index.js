Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
console.log(web3.eth.accounts[0])

var accounts;
var account;
var abi;

///******** IMPORTANT ************
//every time you deploy a new version of the contract you have to update this
var contractAddr = "0xe9b8f3b1bef59d714f9980a55966852d4815f6df";
//every time you deploy a new version of the contract you have to update this
var browser_deaddrop2_sol_deaddropContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newMsg","type":"string"}],"name":"setNewMessage","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getMessage","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMinPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"data","type":"string"},{"name":"minPct","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":false,"name":"mesg","type":"string"}],"name":"MessageChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"price","type":"uint256"}],"name":"ChangeFailed","type":"event"}]);




//Javascript stuff to do some work before any other functions can run!
window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];

  });


   var deployedContract = web3.eth.getCode(contractAddr);
    console.log(deployedContract);
    //get a reference to your contract (abi declared earlier at the top)
    abi = browser_deaddrop2_sol_deaddropContract.at(contractAddr);

    //handlers for contract Events.. you can write better handlers such as updating the info on the page...
    //MessageChanged(address sender, uint price, string mesg)
    var MessageChanged = abi.MessageChanged({fromBlock: web3.eth.blockNumber, toBlock: 'latest'});
        MessageChanged.watch(function(error, result) {
          if (error == null) {
             console.log("Message Changed! (sender: " + result.args.sender.toString() + ", price : "  + result.args.price.toString(20) + ", new message: " + result.args.mesg +" )");
             var message = abi.getMessage.call();
              var messageElement = document.getElementById("message");
              messageElement.innerHTML = message;
             return true;
          }else{
              console.log(error);
          }
        });

    var ChangeFailed = abi.ChangeFailed({fromBlock: web3.eth.blockNumber, toBlock: 'latest'});
        ChangeFailed.watch(function(error, result) {
          if (error == null) {
             console.log("Message change failed! (sender: " + result.args.sender + ", price : "  + result.args.price.toString(20) + " )");
             return true;
          }else{
              console.log(error);
          }
        });


    var address = document.getElementById("address");
    address.innerHTML = web3.eth.accounts[0]; //same as eth.coinbase

    var balance = document.getElementById("userbalance");
    var userbalance = web3.eth.getBalance(web3.eth.coinbase);
    balance.innerHTML = userbalance;



    var contractElement = document.getElementById("contract");
    contractElement.innerHTML = contractAddr;


    var message = abi.getMessage.call();
    var messageElement = document.getElementById("message");
    messageElement.innerHTML = message;

    var minPriceElem = document.getElementById("minPrice");
    var minPrice = abi.getMinPrice.call();
    minPriceElem.innerHTML = minPrice.valueOf(); //recall this is a BigInt - regular JS cannot handle large ints


    /*. 
This funciton is sweet because it tells us the gas used and when a transaction is completed.
It's reusable so just ctrl+c ctrl+v when needed
source: https://github.com/b9lab/live-coding-result/blob/master/app/javascripts/app.js
*/
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
                setTimeout(function () {
                           transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } else {
                console.log("transaction completed; gas used: " + receipt.gasUsed );
                console.log(receipt);
                // insert custom behaviour code here.. update an element, play a sound etc.

                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };
    
    if (Array.isArray(txnHash)) {
        var promises = [];
        txnHash.forEach(function (oneTxHash) {
                        promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
                        });
        return Promise.all(promises);
    } else {
        return new Promise(function (resolve, reject) {
                           transactionReceiptAsync(txnHash, resolve, reject);
                           });
    }
};


}//window.onload

function postMessage(){
      
      var newMsgData = document.getElementById("newMessage").value;
      var amount = parseInt(document.getElementById("newPrice").value);
      //TODO: make a status field to show the user what is happening!
      console.log("Posting new message... (please wait)");
      console.log(abi);
      console.log(newMsgData);
      console.log(amount);

      abi.setNewMessage(newMsgData, {from: account, gas:3000000, value: amount})
}



