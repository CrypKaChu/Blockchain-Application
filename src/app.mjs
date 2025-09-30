import Blockchain from "./blockchain/blockchain.mjs";
import Block from "./blockchain/block.mjs";
import Transaction from "./blockchain/transaction.mjs";
import { readJSONFile } from "./blockchain/readJSON.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

function main() {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log("Usage:");
        console.log("  node app.mjs mine <private-key-file> <file1> <file2>");
        console.log("  node app.mjs validate");
        console.log("  node app.mjs status");
        console.log("");
        console.log("Examples:");
        console.log("  node app.mjs mine 12345678-private.key testfile.txt test2file.json");
        console.log("  node app.mjs validate");
        console.log("  node app.mjs status");
        process.exit(1);
    }

    const command = args[0];

    try {
        // Create blockchain instance
        const chain = new Blockchain();

        // Load existing blockchain state
        chain.loadBlockchainState();
        chain.loadMiningResults();

        if (command === 'mine') {
            // Mining command
            if (args.length < 4) {
                console.log("Usage: node app.mjs mine <private-key-file> <file1> <file2>");
                process.exit(1);
            }

            const privateKeyFile = args[1];
            const file1 = args[2];
            const file2 = args[3];

            // Get the directory of the current file
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

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

            const file1Name = path.basename(file1);
            const file2Name = path.basename(file2);

            // Read file contents
            const file1Content = fs.readFileSync(file1Path, 'utf-8');
            const file2Content = fs.readFileSync(file2Path, 'utf-8');

            // Create a block with the file contents as transactions
            const blockData = {
                file1Name: file1Name,
                file2Name: file2Name,
                timestamp: Date.now(),
                inputFiles: {
                    file1: file1Content,
                    file2: file2Content,
                    privateKey: privateKeyFile
                }
            };

            // Mine the block with the specified format
            const result = chain.createAndMineBlock(blockData, 4);

            // Save results to JSON file
            chain.saveMiningResults();

        } else if (command === 'validate') {
            // Validation command
            console.log("🔍 Validating blockchain...\n");

            const isValid = chain.isChainValid();

            if (isValid) {
                console.log("✅ Blockchain is VALID!");
                console.log(`📊 Total blocks: ${chain.blocks.length}`);
                console.log(`⛏️  Total mining results: ${chain.miningResults.length}`);
            } else {
                console.log("❌ Blockchain is INVALID!");
                process.exit(1);
            }

        } else if (command === 'status') {
            // Status command
            console.log("📊 Blockchain Status\n");
            console.log("=".repeat(50));

            const status = chain.getSummary();
            console.log(`Total Blocks: ${status.totalBlocks}`);
            console.log(`Chain Valid: ${status.isValid ? '✅ YES' : '❌ NO'}`);
            console.log(`Mining Results: ${status.miningResults}`);

            if (status.latestBlock) {
                console.log("\nLatest Block:");
                console.log(`  Block #${status.latestBlock.blockNumber}`);
                console.log(`  Hash: ${status.latestBlock.hash}`);
                console.log(`  Timestamp: ${new Date(status.latestBlock.timestamp).toLocaleString()}`);
                console.log(`  Transactions: ${status.latestBlock.transactionCount}`);
                console.log(`  Valid: ${status.latestBlock.isValid ? '✅' : '❌'}`);
            }

        } else if (command === 'block') {
            if (args.length < 2) {
                console.log("Usage: node app.mjs block <block_hash>");
                process.exit(1);
            }
            const blockHash = args[1];
            const block = chain.blocks.find(b => b.hash === blockHash);

            if (!block) {
                console.log(`Block with hash ${blockHash} not found.`);
                process.exit(1);
            }

            // Find previous block hash
            const prevHash = block.previousHash || '0'.repeat(64);

            // Print block info
            console.log(`Block: ${block.hash}`);
            console.log(`Previous block: ${prevHash}`);
            console.log(`Transactions: ${block.transactions.length}`);

            block.transactions.forEach((tx, idx) => {
                console.log(`Transaction ${idx + 1}:`);
                if (tx.file1name) console.log(`  filename: ${tx.file1name}`);
                if (tx.hash) console.log(`  hash: ${tx.hash}`);
                if (tx.signature) console.log(`  signature: ${tx.signature}`);
                // Print any other fields except filename, hash, signature
                for (const [key, value] of Object.entries(tx)) {
                    if (!['filename', 'hash', 'signature'].includes(key)) {
                        console.log(`  ${key}: ${value}`);
                    }
                }
            });

            // Print other block info
            console.log(`Timestamp: ${new Date(block.timestamp).toISOString()}`);
            console.log(`Difficulty: ${block.difficulty !== undefined ? block.difficulty : chain.difficulty}`);
            console.log(`Nonce: ${block.nonce}`);
            console.log("#".repeat(80));
            process.exit(0);
        } else {
            console.log(`Unknown command: ${command}`);
            console.log("Available commands: mine, validate, status");
            process.exit(1);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();