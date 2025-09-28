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
    const dataToHash = this.blockNumber.toString() +
      this.previousHash +
      JSON.stringify(this.transactions)
      + this.nonce.toString();
    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }

  mineBlock(difficulty) {
    console.log(`Mining block ${this.blockNumber} with difficulty ${difficulty}...`);
    const startTime = Date.now();


    let nonce = 0;
    let attempts = 0;
    const target = '0'.repeat(difficulty);

    while (true) {
      this.nonce = nonce;
      const hash = this.calculateHash();

      if (hash.startsWith(target)) {
        this.hash = hash;
        const endTime = Date.now();
        const miningTime = (endTime - startTime) / 1000;

        console.log(`✅ Block ${this.blockNumber} mined successfully!`);
        console.log(`🔗 Hash: ${hash}`);
        console.log(`🔢 Nonce: ${nonce}`);
        console.log(`⏱️  Mining time: ${miningTime.toFixed(2)} seconds`);
        console.log(`🎯 Difficulty: ${difficulty} (${target})`);
        console.log(`📊 Attempts: ${attempts.toLocaleString()}`);
        console.log(`⚡ Hash rate: ${(attempts / miningTime).toFixed(2)} hashes/sec\n`);

        return {
          hash,
          nonce,
          difficulty,
          miningTime,
          attempts,
          hashRate: attempts / miningTime
        };
      }

      nonce++;
      attempts++;

      // Optional: Add progress indicator for long mining operations
      if (attempts % 100000 === 0) {
        console.log(`Mining progress: ${attempts.toLocaleString()} attempts...`);
      }
    }
  }

  // Method to validate if the block's hash is correct
  isValid() {
    return this.hash === this.calculateHash();
  }

  // Method to get block summary
  getSummary() {
    return {
      blockNumber: this.blockNumber,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      transactionCount: this.transactions.length,
      isValid: this.isValid()
    };
  }
}