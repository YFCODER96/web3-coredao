const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

const { APIKEY, PRIVATEKEY, SENDER_ADDRESS, RECIPIENT_ADDRESS, AMOUNT_LIMIT } =
  process.env;

const Web3 = require("web3").Web3;

const providerUrl = "https://api.infstones.com/core/mainnet/" + APIKEY;
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

async function getBalance(address: string) {
  let balance = await web3.eth.getBalance(address);
  let str = web3.utils.fromWei(balance, "ether");
  let b = Number(str).toFixed(3);
  return b;
}

// 转账
async function transfer(
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
) {
  const nonce = await web3.eth.getTransactionCount(fromAddress, "latest");

  const transaction = {
    to: toAddress,
    value: amount,
    gas: 30000,
    nonce: nonce,
    gasPrice: await web3.eth.getGasPrice(),
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    transaction,
    privateKey
  );
  return new Promise((resolve) => {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on("receipt", (receipt: any) => {
        console.log("交易发送成功:", receipt);
        resolve(receipt);
      });
  });
}

async function main(address: string) {
  while (true) {
    let balanceBigInit = await web3.eth.getBalance(address);
    let balanceNumber = web3.utils.fromWei(balanceBigInit, "ether");
    let amountLimit = Number(AMOUNT_LIMIT).toFixed(5);

    if (balanceNumber > amountLimit) {
      console.log("余额足够");
      console.log(balanceNumber, amountLimit);

      // 转账
      let amountTransfer = web3.utils.toWei(balanceNumber - 0.001, "ether");
      await transfer(
        SENDER_ADDRESS as string,
        RECIPIENT_ADDRESS as string,
        amountTransfer,
        PRIVATEKEY as string
      );
    } else {
      console.log("余额不足");
    }
  }
}
main(SENDER_ADDRESS as string);
