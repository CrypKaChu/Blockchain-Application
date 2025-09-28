import Blockchain from "./blockchain/blockchain.mjs";
import Block from "./blockchain/block.mjs";
import Transaction from "./blockchain/transaction.mjs";
import { readJSONFile } from "./blockchain/readJSON.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
/*
- Create transactions
- Create blocks
- Mine blocks
- Validate chain
- Process real blockchain data
*/

// function main() {
//     // Get command line arguments


//     console.log("🚀 Starting the blockchain application...\n");
    
//     const chain = new Blockchain();
    
//     // Create genesis block
//     chain.createGenesisBlock();
    
//     // Load block data (string)
//     const blockData = readJSONFile('./src/datastore/data-to-mine.json');
//     console.log("📄 Loaded data to mine:", JSON.stringify(blockData, null, 2));
    
//     // Method 1: Mine with simple data (existing functionality)
//     console.log("=".repeat(50));
//     console.log("METHOD 1: Simple Data Mining");
//     console.log("=".repeat(50));
//     const result = chain.mineBlock(blockData, 4);
    
//     // Method 2: Create and mine a block with transactions
//     console.log("=".repeat(50));
//     console.log("METHOD 2: Block with Transactions Mining");
//     console.log("=".repeat(50));
    
//     // Create some sample transactions
//     const transactions = [
//         new Transaction("Alice", "Bob", 50),
//         new Transaction("Bob", "Charlie", 25),
//         new Transaction("Charlie", "Alice", 10)
//     ];
    
//     const blockResult = chain.createAndMineBlock(transactions, 4);
    
//     // Method 3: Mine individual block
//     console.log("=".repeat(50));
//     console.log("METHOD 3: Individual Block Mining");
//     console.log("=".repeat(50));
    
//     const newBlock = new Block(2, chain.getLatestBlock().hash, [
//         new Transaction("David", "Eve", 100)
//     ]);
    
//     const individualMiningResult = newBlock.mineBlock(4);
//     chain.addBlock(newBlock);
    
//     // Validate the entire chain
//     console.log("=".repeat(50));
//     console.log("CHAIN VALIDATION");
//     console.log("=".repeat(50));
//     chain.isChainValid();
    
//     // Display blockchain summary
//     console.log("=".repeat(50));
//     console.log("BLOCKCHAIN SUMMARY");
//     console.log("=".repeat(50));
//     console.log(JSON.stringify(chain.getSummary(), null, 2));
// }

// main();
function main() {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 4) {
        console.log("Usage: node app.mjs mine <private-key-file> <file1> <file2>");
        console.log("Example: node app.mjs mine 12345678-private.key testfile.txt test2file.json");
        process.exit(1);
    }

    const command = args[0];
    const privateKeyFile = args[1];
    const file1 = args[2];
    const file2 = args[3];

    if (command !== 'mine') {
        console.log("Only 'mine' command is supported");
        process.exit(1);
    }

    // Get the directory of the current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    console.log("Starting the blockchain application...");

    try {
        // Read the files
        const file1Path = path.resolve(file1);
        const file2Path = path.resolve(file2);
        const privateKeyPath = path.resolve(privateKeyFile);

        // Check if files exist
        if (!fs.existsSync(file1Path)) {
            console.error(`Error: File ${file1} does not exist`);
            process.exit(1);
        }
        if (!fs.existsSync(file2Path)) {
            console.error(`Error: File ${file2} does not exist`);
            process.exit(1);
        }
        if (!fs.existsSync(privateKeyPath)) {
            console.error(`Error: Private key file ${privateKeyFile} does not exist`);
            process.exit(1);
        }

        // Read file contents
        const file1Content = fs.readFileSync(file1Path, 'utf-8');
        const file2Content = fs.readFileSync(file2Path, 'utf-8');
        
        // Create blockchain and mine the block
        const chain = new Blockchain();
        
        // Create a block with the file contents as transactions
        const blockData = {
            file1: file1Content,
            file2: file2Content,
            timestamp: Date.now()
        };

        // Mine the block with the specified format
        const result = chain.mineBlock(JSON.stringify(blockData), 4, 1);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();