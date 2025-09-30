// File: blockchain.mjs
import crypto from 'crypto';
import Block from './block.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default class Blockchain {
  constructor() {
    this.blocks = [];
    this.difficulty = 4;
    this.miningResults = [];

    // Set default data directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.dataDir = path.join(__dirname, "..", 'datastore');

    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  createGenesisBlock() {
    // Create a block with blockNumber 0, previousHash '0', and no transactions
    const genesisBlock = new Block(0, '0', []);
    // Mine the block to get a valid hash
    genesisBlock.mineBlock(this.difficulty);
    // Add the block to the chain
    this.blocks.push(genesisBlock);
  }
  
  // Create and mine a new block
  createAndMineBlock(blockData, difficulty = this.difficulty) {
    const previousHash = this.getLatestBlock() ? this.getLatestBlock().hash : '0';
    const blockNumber = this.blocks.length;

    // Convert blockData to transactions if needed
    const transactions = [];
    if (blockData) {
      // Create a simple transaction-like object for the block data
      transactions.push({
        hash: crypto.createHash("sha256").update(JSON.stringify(blockData)).digest("hex"),
        data: blockData
      });
    }

    const newBlock = new Block(blockNumber, previousHash, transactions);
    const miningResult = newBlock.mineBlock(difficulty);

    this.addBlock(newBlock);
    this.miningResults.push(miningResult);
    
    this.saveBlockchainState();

    return { block: newBlock, miningResult };
  }

  // Keep blockchain-level methods
  saveMiningResults(filename = null) {
    const defaultFilename = path.join(this.dataDir, 'mining-results.json');
    const filepath = filename || defaultFilename;

    const outputData = {
      metadata: {
        totalBlocks: this.miningResults.length,
        generatedAt: new Date().toISOString(),
        difficulty: this.difficulty
      },
      miningResults: this.miningResults
    };

    try {
      fs.writeFileSync(filepath, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Mining results saved to: ${filepath}`);
      return true;
    } catch (error) {
      console.error('Error saving mining results:', error.message);
      return false;
    }

    if (this.blocks.length === 0) {
      this.createGenesisBlock();
    }
  }

  loadMiningResults(filename = null) {
    const defaultFilename = path.join(this.dataDir, 'mining-results.json');
    const filepath = filename || defaultFilename;

    try {
      if (fs.existsSync(filepath)) {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        this.miningResults = data.miningResults || [];
        console.log(`📂 Loaded ${this.miningResults.length} mining results from ${filepath}`);
        return data;
      } else {
        console.log(`📂 No existing mining results file found: ${filepath}`);
        return null;
      }
    } catch (error) {
      console.error('Error loading mining results:', error.message);
      return null;
    }
  }

  getMiningSummary() {
    if (this.miningResults.length === 0) {
      return { message: "No mining results available" };
    }

    const totalTime = this.miningResults.reduce((sum, result) => sum + result.timeTaken, 0);
    const avgTime = totalTime / this.miningResults.length;
    const fastestMining = Math.min(...this.miningResults.map(r => r.timeTaken));
    const slowestMining = Math.max(...this.miningResults.map(r => r.timeTaken));

    return {
      totalBlocks: this.miningResults.length,
      totalMiningTime: parseFloat(totalTime.toFixed(2)),
      averageMiningTime: parseFloat(avgTime.toFixed(2)),
      fastestMining: parseFloat(fastestMining.toFixed(2)),
      slowestMining: parseFloat(slowestMining.toFixed(2)),
      difficulty: this.difficulty,
      results: this.miningResults
    };
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
      latestBlock: this.getLatestBlock()?.getSummary(),
      miningResults: this.miningResults.length
    };
  }

  // Add this method to load existing blockchain state
  loadBlockchainState() {
    try {
      if (fs.existsSync(path.join(this.dataDir, 'blockchain.json'))) {
        const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, 'blockchain.json'), 'utf-8'));
        
        // Convert loaded block data back to Block instances
        this.blocks = data.blocks.map(blockData => {
          const block = new Block(blockData.blockNumber, blockData.previousHash, blockData.transactions);
          block.timestamp = blockData.timestamp;
          block.nonce = blockData.nonce;
          block.hash = blockData.hash;
          return block;
        });
        
        console.log(`📂 Loaded ${this.blocks.length} blocks from blockchain state`);
        return true;
      }
    } catch (error) {
      console.error('Error loading blockchain state:', error.message);
    }
    return false;
  }

  // Add this method to save blockchain state
  saveBlockchainState() {
    try {
      const blockchainData = {
        blocks: this.blocks,
        difficulty: this.difficulty,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(
        path.join(this.dataDir, 'blockchain.json'), 
        JSON.stringify(blockchainData, null, 2)
      );
      console.log(`💾 Blockchain state saved with ${this.blocks.length} blocks`);
      return true;
    } catch (error) {
      console.error('Error saving blockchain state:', error.message);
      return false;
    }
  }
}