const { default: axios } = require("axios");
const converter = require("json-2-csv");

var fs = require("fs");

async function getTransactionsByAccount(accountHash) {
  let url = `https://event-store-api-clarity-mainnet.make.services/accounts/${accountHash}/transfers?page=1&limit=100`;
  const response = await axios.get(url);
  const pageCount = response.data.pageCount;
  const itemCount = response.data.itemCount;
  let transactions = [];
  console.log("Total of ", pageCount, " pages found");
  console.log("Found ", itemCount, " transactions");
  //   console.log('data = ', response.data.data)
  transactions = [...transactions, ...response.data.data];
  for (let index = 2; index <= pageCount; index++) {
    console.log("Getting transactions in page ", index);
    let url = `https://event-store-api-clarity-mainnet.make.services/accounts/${accountHash}/transfers?page=${index}&limit=100`;
    const response = await axios.get(url);
    // const type =
    //   response.data.data.fromAccount === accountHash ? "Sent" : "Received";
    transactions = [...transactions, ...response.data.data];
  }
  return transactions;
}

async function main() {
  const accountHash = process.argv[2];
  console.log("Extracting transactions of ", accountHash);
  const transactions = await getTransactionsByAccount(accountHash);
  console.log("transactions length = ", transactions.length);
  const csv = await converter.json2csvAsync(transactions);
  fs.writeFileSync(`${accountHash}_transactions.csv`, csv);
}

main();
