const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile");

let lottery;
let account;

beforeEach(async () => {
  account = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: account[0], gas: "1000000" });
});

describe("Lottery contracts", () => {
  it("should deploy a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allow one account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: account[0], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods
      .getPlayer()
      .call({ from: account[0] });

    assert.equal(account[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: account[0], value: web3.utils.toWei("0.02", "ether") });
    await lottery.methods
      .enter()
      .send({ from: account[1], value: web3.utils.toWei("0.02", "ether") });
    await lottery.methods
      .enter()
      .send({ from: account[2], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods
      .getPlayer()
      .call({ from: account[0] });

    assert.equal(account[0], players[0]);
    assert.equal(account[1], players[1]);
    assert.equal(account[2], players[2]);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({ from: account[0], value: 0 });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can call pick winner", async () => {
    try {
      await lottery.methods.pickWinner.send({ from: account[1] });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to the winner and reset a game", async () => {
    await lottery.methods
      .enter()
      .send({ from: account[0], value: web3.utils.toWei("2", "ether") });

    const initialBalance = await web3.eth.getBalance(account[0]);

    await lottery.methods.pickWinner().send({ from: account[0] });

    const finalBalance = await web3.eth.getBalance(account[0]);
    const difference = finalBalance - initialBalance;
    // console.log(difference);

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});
