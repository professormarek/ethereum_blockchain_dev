Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
console.log(web3.eth.accounts[0])

var address = document.getElementById("address");
address.innerHTML = web3.eth.accounts[0];