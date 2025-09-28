// File: block.mjs
import crypto from 'crypto';

export default class Block {
  constructor(blockNumber, previousHash = '0', transactions = []) {
    this.blockNumber = blockNumber;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.transactions = transactions; // Array to hold Transaction objects
    this.nonce = 0; // A number used for mining
    this.hash = ""; // The block's cryptographic hash
   }

   calculateHash() {
    const dataToHash = this.blockNumber.toString() + this.previousHash + JSON.stringify(this.transactions) + this.nonce.toString();
    return crypto.createHash("sha256").update(dataToHash).digest("hex");
   }

   mineBlock(difficulty) {
    let nonce = 0;
    const target = '0'.repeat(difficulty);

    while (true) {
      const hash = this.calculateHash(blockData, nonce);

      if (hash.startsWith(target)) {
        this.hash = hash;
        console.log(`Block mined: ${hash} at nonce ${nonce}`);
        return { hash, nonce };
      }
      
      nonce++;
   }
  }
}