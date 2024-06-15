"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../config.env") });
const ConcurrencyRequest_1 = __importDefault(require("./tools/ConcurrencyRequest"));
const { APIKEY, PRIVATEKEY, SENDER_ADDRESS, RECIPIENT_ADDRESS, AMOUNT_LIMIT } = process.env;
const Web3 = require("web3").Web3;
const providerUrl = "https://api.infstones.com/core/mainnet/" + APIKEY;
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
function transfer(fromAddress, toAddress, amount, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nonce = yield web3.eth.getTransactionCount(fromAddress, "latest");
            const transaction = {
                to: toAddress,
                value: amount,
                gas: 30000,
                nonce: nonce,
                gasPrice: yield web3.eth.getGasPrice(),
            };
            const signedTx = yield web3.eth.accounts.signTransaction(transaction, privateKey);
            return new Promise((resolve) => {
                web3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .on("receipt", (receipt) => {
                    console.log("交易发送成功:", receipt);
                    resolve(receipt);
                });
            });
        }
        catch (error) {
            console.log("转账失败:💥");
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let address = SENDER_ADDRESS;
        let balanceBigInit = yield web3.eth.getBalance(address);
        let balanceNumber = web3.utils.fromWei(balanceBigInit, "ether");
        let amountLimit = Number(AMOUNT_LIMIT).toFixed(5);
        if (balanceNumber > amountLimit) {
            console.log("余额足够");
            console.log(balanceNumber, amountLimit);
            let amountTransfer = web3.utils.toWei(balanceNumber - 0.001, "ether");
            yield transfer(SENDER_ADDRESS, RECIPIENT_ADDRESS, amountTransfer, PRIVATEKEY);
        }
        else {
            console.log("余额不足");
        }
    });
}
const concurrencyRequest = new ConcurrencyRequest_1.default({ maxConcurrencyCount: 10 });
setInterval(() => {
    concurrencyRequest.addTask(main);
}, 0);
