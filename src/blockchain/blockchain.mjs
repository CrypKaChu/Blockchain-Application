// File: blockchain.mjs
import Block from './block.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Blockchain class - Core blockchain implementation with persistence and validation
 * Manages the entire blockchain state, including blocks, mining, and data persistence
 */
export default class Blockchain {
  /**
   * Initialize a new blockchain instance
   * Sets up data directory, initializes empty chain, and configures mining difficulty
   */
  constructor() {
    // Initialize empty blockchain
    this.blocks = [];
    // Set proof-of-work difficulty (number of leading zeros required)
    this.difficulty = 4;
    // Store mining performance results for analysis
    this.miningResults = [];

    // Set up data directory for persistence
    // Get current file path and resolve to project structure
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.dataDir = path.join(__dirname, "..", 'datastore');

    // Ensure data directory exists for file operations
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Create the genesis block - the first block in the blockchain
   * Genesis block has special properties: blockNumber=0, previousHash='0', no transactions
   * This block must be mined to establish the initial proof-of-work
   */
  createGenesisBlock() {
    // Create genesis block with special parameters
    // Block number 0, previous hash '0' (no previous block), empty transactions array
    const genesisBlock = new Block(0, '0', []);
    
    // Mine the genesis block to establish initial proof-of-work
    // This creates a valid hash that meets the difficulty requirement
    genesisBlock.mineBlock(this.difficulty);
    
    // Add the mined genesis block to the blockchain
    this.blocks.push(genesisBlock);
  }
  
  /**
   * Create and mine a new block with the provided transactions
   * This is the core method for adding new blocks to the blockchain
   * 
   * @param {Array} transactions - Array of transaction objects to include in the block
   * @param {number} difficulty - Mining difficulty (optional, defaults to blockchain difficulty)
   * @returns {Object} Object containing the new block and mining result
   */
  createAndMineBlock(transactions, difficulty = this.difficulty) {
    // Ensure genesis block exists before creating new blocks
    if (this.blocks.length === 0) {
      this.createGenesisBlock();
    }
    
    // Get the hash of the latest block to maintain chain integrity
    const previousHash = this.getLatestBlock() ? this.getLatestBlock().hash : '0';
    
    // Calculate the next block number (sequential numbering)
    const blockNumber = this.blocks.length;
    
    // Create new block with transactions
    const newBlock = new Block(blockNumber, previousHash, transactions || []);
    
    // Mine the block using proof-of-work algorithm
    const miningResult = newBlock.mineBlock(difficulty);
    
    // Add the mined block to the blockchain
    this.addBlock(newBlock);
    
    // Store mining performance data for analysis
    this.miningResults.push(miningResult);
    
    // Persist blockchain state to disk
    this.saveBlockchainState();
    
    // Return both the block and mining result for further processing
    return { block: newBlock, miningResult };
  }

  /**
   * Save mining results to a JSON file for analysis and persistence
   * Stores performance data including timing, difficulty, and block information
   * 
   * @param {string} filename - Optional custom filename, defaults to 'mining-results.json'
   * @returns {boolean} Success status of the save operation
   */
  saveMiningResults(filename = null) {
    // Set default filename in datastore directory
    const defaultFilename = path.join(this.dataDir, 'mining-results.json');
    const filepath = filename || defaultFilename;

    // Structure the output data with metadata and results
    const outputData = {
      metadata: {
        totalBlocks: this.miningResults.length,
        generatedAt: new Date().toISOString(),
        difficulty: this.difficulty
      },
      miningResults: this.miningResults
    };

    try {
      // Write JSON data with pretty formatting (2-space indentation)
      fs.writeFileSync(filepath, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Mining results saved to: ${filepath}`);
      return true;
    } catch (error) {
      console.error('Error saving mining results:', error.message);
      return false;
    }
  }

  /**
   * Load mining results from a JSON file
   * Restores previously saved mining performance data for analysis
   * 
   * @param {string} filename - Optional custom filename, defaults to 'mining-results.json'
   * @returns {Object|null} Loaded data object or null if file doesn't exist/error
   */
  loadMiningResults(filename = null) {
    // Set default filename in datastore directory
    const defaultFilename = path.join(this.dataDir, 'mining-results.json');
    const filepath = filename || defaultFilename;

    try {
      // Check if file exists before attempting to read
      if (fs.existsSync(filepath)) {
        // Parse JSON data from file
        const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        
        // Restore mining results array (fallback to empty array if corrupted)
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

  /**
   * Generate a comprehensive summary of mining performance
   * Calculates statistics including total time, averages, and performance metrics
   * 
   * @returns {Object} Summary object with mining statistics and performance data
   */
  getMiningSummary() {
    // Handle case where no mining has occurred
    if (this.miningResults.length === 0) {
      return { message: "No mining results available" };
    }

    // Calculate total mining time across all blocks
    const totalTime = this.miningResults.reduce((sum, result) => sum + result.timeTaken, 0);
    
    // Calculate average mining time per block
    const avgTime = totalTime / this.miningResults.length;
    
    // Find fastest and slowest mining times for performance analysis
    const fastestMining = Math.min(...this.miningResults.map(r => r.timeTaken));
    const slowestMining = Math.max(...this.miningResults.map(r => r.timeTaken));

    // Return comprehensive summary with performance metrics
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

  /**
   * Add a new block to the blockchain
   * Simple method to append a block to the chain
   * 
   * @param {Block} block - The block object to add to the chain
   */
  addBlock(block) {
    this.blocks.push(block);
    console.log(`Block ${block.blockNumber} added to blockchain`);
  }

  /**
   * Validate the entire blockchain for integrity
   * Performs comprehensive validation including:
   * - Genesis block validation
   * - Hash integrity verification
   * - Chain linking validation
   * 
   * @returns {boolean} True if blockchain is valid, false otherwise
   */
  isChainValid() {
    // Check if blockchain exists
    if (this.blocks.length === 0) {
      console.log("Blockchain is empty");
      return false;
    }

    // Validate genesis block (first block in chain)
    const genesisBlock = this.blocks[0];
    if (genesisBlock.hash !== genesisBlock.calculateHash()) {
      console.log("Genesis block is not valid");
      return false;
    }

    // Validate all subsequent blocks in the chain
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      // Verify current block's hash matches its calculated hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Block ${currentBlock.blockNumber} hash is not valid`);
        return false;
      }

      // Verify chain linking - current block's previousHash must match previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`Block ${currentBlock.blockNumber} previous hash is not valid`);
        return false;
      }
    }
    
    // All validations passed
    return true;
  }

  /**
   * Get the latest (most recent) block in the blockchain
   * 
   * @returns {Block|null} The latest block or null if blockchain is empty
   */
  getLatestBlock() {
    return this.blocks.length > 0 ? this.blocks[this.blocks.length - 1] : null;
  }

  /**
   * Load existing blockchain state from JSON file
   * Handles robust loading with error recovery and data validation
   * Reconstructs Block instances from serialized data
   * 
   * @returns {boolean} True if successfully loaded, false if starting fresh
   */
  loadBlockchainState() {
    try {
      const blockchainFile = path.join(this.dataDir, 'blockchain.json');
      
      if (fs.existsSync(blockchainFile)) {
        const fileContent = fs.readFileSync(blockchainFile, 'utf-8');
        
        // Handle empty or corrupted files gracefully
        if (!fileContent.trim()) {
          console.log("📂 Blockchain file is empty, starting fresh");
          this.blocks = [];
          return false;
        }
        
        // Parse JSON data
        const data = JSON.parse(fileContent);
        
        // Validate data structure
        if (!data.blocks || !Array.isArray(data.blocks)) {
          console.log("📂 Invalid blockchain data, starting fresh");
          this.blocks = [];
          return false;
        }
        
        // Reconstruct Block instances from serialized data
        // This is crucial because JSON.parse returns plain objects, not class instances
        this.blocks = data.blocks.map(blockData => {
          // Create new Block instance with basic properties
          const block = new Block(blockData.blockNumber, blockData.previousHash, blockData.transactions);
          
          // Restore additional properties that were serialized
          block.timestamp = blockData.timestamp;
          block.nonce = blockData.nonce;
          block.hash = blockData.hash;
          
          return block;
        });
        
        console.log(`📂 Loaded ${this.blocks.length} blocks from blockchain state`);
        return true;
      } else {
        console.log("📂 No blockchain file found, starting fresh");
        this.blocks = [];
        return false;
      }
    } catch (error) {
      console.error('Error loading blockchain state:', error.message);
      console.log("📂 Starting with empty blockchain");
      this.blocks = [];
      return false;
    }
  }

  /**
   * Save current blockchain state to JSON file
   * Persists the entire blockchain including blocks, difficulty, and metadata
   * 
   * @returns {boolean} True if save successful, false otherwise
   */
  saveBlockchainState() {
    try {
      // Structure the blockchain data for serialization
      const blockchainData = {
        blocks: this.blocks,
        difficulty: this.difficulty,
        lastUpdated: new Date().toISOString()
      };
      
      // Write to blockchain.json with pretty formatting
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