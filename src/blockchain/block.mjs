// File: block.mjs
import crypto from 'crypto';

export default class Block {
  constructor(blockNumber, previousHash = '0', transactions = []) {
    this.blockNumber = blockNumber;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = "";
  }

  calculateHash() {
    const transactionsString = JSON.stringify(this.transactions.map(tx => tx.hash));
    
    const dataToHash = (
      this.blockNumber.toString() +
      this.timestamp + // Include the fixed timestamp
      this.previousHash +
      transactionsString +
      this.nonce.toString()
    );
  
    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }

  mineBlock(difficulty) {
    let nonce = 0;
    const target = '0'.repeat(difficulty);
    const startTime = new Date();

    while (true) {
      this.nonce = nonce;
      const hash = this.calculateHash();

      if (hash.startsWith(target)) {
        const endTime = new Date();
        const timeTaken = (endTime.getTime() - startTime.getTime()) / 1000;

        // Format the time strings
        const startTimeStr = startTime.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const endTimeStr = endTime.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        // Create mining result object
        const miningResult = {
          blockNumber: this.blockNumber,
          hash,
          nonce,
          difficulty,
          timeTaken: parseFloat(timeTaken.toFixed(2)),
          startTime: startTimeStr,
          endTime: endTimeStr,
          timestamp: startTime.getTime(),
          transactions: this.transactions
        };

        // Update block properties
        this.hash = hash;
        this.nonce = nonce;

        // Output
        console.log('#'.repeat(50));
        console.log(`Block ${this.blockNumber} Mined`);
        console.log(`Proof of work: ${hash} at nonce ${nonce}`);
        console.log(`Time taken: ${timeTaken.toFixed(2)} seconds, starting at ${startTimeStr}, ending at ${endTimeStr}`);
        console.log(`Difficulty: ${difficulty}`);
        console.log('#'.repeat(50));

        return miningResult;
      }

      nonce++;
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