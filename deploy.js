const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  "frozen short ridge useless pulse rapid bonus pony inquiry peanut wire glide",
  "https://rinkeby.infura.io/v3/ae94b8e44121418085b51d07b944268c"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const account = await web3.eth.getAccounts();
  console.log(account, "account");
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: "1000000", from: account[0] });

  console.log(interface);
  console.log("contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
