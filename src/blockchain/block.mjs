// File: block.mjs
import crypto from 'crypto';

/**
 * Block class - Represents a single block in the blockchain
 * Each block contains transactions, proof-of-work, and links to previous block
 */
export default class Block {
  /**
   * Initialize a new block with the provided parameters
   * 
   * @param {number} blockNumber - Sequential block number in the chain
   * @param {string} previousHash - Hash of the previous block (or '0' for genesis)
   * @param {Array} transactions - Array of transaction objects to include in this block
   */
  constructor(blockNumber, previousHash = '0', transactions = []) {
    this.blockNumber = blockNumber;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = "";
  }

  /**
   * Calculate the SHA256 hash of this block
   * Hash includes all block data: number, timestamp, previous hash, transactions, and nonce
   * This hash is used for proof-of-work and blockchain integrity
   * 
   * @returns {string} SHA256 hash as hexadecimal string
   */
  calculateHash() {
    // Extract transaction hashes for inclusion in block hash
    const transactionsString = JSON.stringify(this.transactions.map(tx => tx.hash));
    
    // Combine all block data into a single string for hashing
    const dataToHash = (
      this.blockNumber.toString() +
      this.timestamp + // Include the fixed timestamp
      this.previousHash +
      transactionsString +
      this.nonce.toString()
    );
  
    // Generate SHA256 hash and return as hexadecimal string
    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }

  /**
   * Mine this block using proof-of-work algorithm
   * Continuously increments nonce until hash meets difficulty requirement
   * This is the computationally expensive process that secures the blockchain
   * 
   * @param {number} difficulty - Number of leading zeros required in hash
   * @returns {Object} Mining result object with performance metrics
   */
  mineBlock(difficulty) {
    let nonce = 0;
    // Create target string with required leading zeros
    const target = '0'.repeat(difficulty);
    const startTime = new Date();

    // Proof-of-work loop - continue until hash meets difficulty requirement
    while (true) {
      // Set current nonce and calculate hash
      this.nonce = nonce;
      const hash = this.calculateHash();

      // Check if hash meets difficulty requirement (starts with required zeros)
      if (hash.startsWith(target)) {
        const endTime = new Date();
        const timeTaken = (endTime.getTime() - startTime.getTime()) / 1000;

        // Format timestamps for human-readable output
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

        // Create comprehensive mining result object
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

        // Update block with final hash and nonce
        this.hash = hash;
        this.nonce = nonce;

        // Display mining results to console
        console.log('#'.repeat(80));
        console.log(`Block ${this.blockNumber} Mined`);
        console.log(`Proof of work: ${hash} at nonce ${nonce}`);
        console.log(`Time taken: ${timeTaken.toFixed(2)} seconds, starting at ${startTimeStr}, ending at ${endTimeStr}`);
        console.log(`Difficulty: ${difficulty}`);
        console.log('#'.repeat(80));

        return miningResult;
      }

      // Increment nonce for next iteration
      nonce++;
    }
  }

  /**
   * Validate if this block's hash is correct
   * Compares stored hash with recalculated hash to detect tampering
   * 
   * @returns {boolean} True if block hash is valid, false if tampered
   */
  isValid() {
    return this.hash === this.calculateHash();
  }

  /**
   * Get a summary object containing key block information
   * 
   * @returns {Object} Summary object with block metadata and validation status
   */
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