// File: blockchain.mjs
import crypto from 'crypto';

export default class Blockchain {
  constructor() {
    this.blocks = [];
        this.difficulty = 4;
  }

  // Core hashing function
  calculateHash(blockData, nonce, blockNumber = 0, previousHash = '0') {
    const dataToHash = blockNumber.toString() + previousHash + blockData + nonce.toString();

    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }

  // Mining function (proof-of-work)
  mineBlock(blockData, difficulty) {
    let nonce = 0;
    const target = '0'.repeat(difficulty);

    while (true) {
      const hash = this.calculateHash(blockData, nonce);

      if (hash.startsWith(target)) {
        console.log(`Block mined:\nSHA256: ${hash}\nnonce: ${nonce}\ndifficulty: ${difficulty}`);
        return { hash, nonce };
      }
      
      nonce++;
    }
  }

  createGenesisBlock() {
    // Create first block
  }

  addBlock(block) {
      // Add block to chain
  }

  isChainValid() {
      // Copy from validatorExample.mjs
  }

  getLatestBlock() {
      // Return last block
  }
}