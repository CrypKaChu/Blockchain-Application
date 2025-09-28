// File: blockchain.mjs
import crypto from 'crypto';
import Block from './block.mjs';

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

  // Mining function
  mineBlock(blockData, difficulty, blockNumber) {
    let nonce = 0;
    const target = '0'.repeat(difficulty);
    const startTime = new Date();

    console.log(`Mining data block with difficulty ${difficulty}...`);

    while (true) {
      const hash = this.calculateHash(blockData, nonce);

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

        // Output
        console.log('#'.repeat(50));
        console.log(`Block ${blockNumber} Mined`);
        console.log(`Proof of work: ${hash} at nonce ${nonce}`);
        console.log(`Time taken: ${timeTaken.toFixed(2)} seconds, starting at ${startTimeStr}, ending at ${endTimeStr}`);
        console.log(`Difficulty: ${difficulty}`);
        console.log('#'.repeat(50));

        return {  hash, nonce, timeTaken, difficulty, blockNumber };
      }

      nonce++;
    }
  }


  // Create and mine a new block with transactions
  createAndMineBlock(transactions, difficulty = this.difficulty) {
    const previousHash = this.getLatestBlock() ? this.getLatestBlock().hash : '0';
    const blockNumber = this.blocks.length;

    const newBlock = new Block(blockNumber, previousHash, transactions);
    const miningResult = newBlock.mineBlock(difficulty);

    this.addBlock(newBlock);
    return { block: newBlock, miningResult };
  }

  createGenesisBlock() {
    if (this.blocks.length === 0) {
      const genesisBlock = new Block(0, '0', []);
      genesisBlock.hash = genesisBlock.calculateHash();
      this.blocks.push(genesisBlock);
      console.log("Genesis block created");
      return genesisBlock;
    }
    return this.blocks[0];
  }

  addBlock(block) {
    this.blocks.push(block);
    console.log(`Block ${block.blockNumber} added to blockchain`);
  }

  isChainValid() {
    if (this.blocks.length === 0) {
      console.log("❌ Blockchain is empty");
      return false;
    }

    // Check the Genesis block
    const genesisBlock = this.blocks[0];
    if (genesisBlock.hash !== genesisBlock.calculateHash()) {
      console.log("❌ Genesis block is not valid");
      return false;
    }

    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      console.log(`Validating block ${currentBlock.blockNumber}...`);

      // Check if current block's hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`❌ Block ${currentBlock.blockNumber} hash is not valid`);
        return false;
      }

      // Check if current block's previous hash matches previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`❌ Block ${currentBlock.blockNumber} previous hash is not valid`);
        return false;
      }
    }

    console.log("✅ Blockchain is valid");
    return true;
  }

  getLatestBlock() {
    return this.blocks.length > 0 ? this.blocks[this.blocks.length - 1] : null;
  }

  // Get blockchain summary
  getSummary() {
    return {
      totalBlocks: this.blocks.length,
      difficulty: this.difficulty,
      isValid: this.isChainValid(),
      latestBlock: this.getLatestBlock()?.getSummary()
    };
  }
}