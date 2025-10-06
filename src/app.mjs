import Blockchain from "./blockchain/blockchain.mjs";
import Transaction from "./blockchain/transaction.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import { createSign, createVerify } from 'crypto';

/**
 * Sign a document with a private key using RSA digital signature
 * Creates a cryptographic signature that proves document authenticity and integrity
 * 
 * @param {string} docPath - Path to the document file to be signed
 * @param {string} privateKeyPath - Path to the private key file
 * @param {string} outputPath - Path where the signature will be saved
 */
async function signDocument(docPath, privateKeyPath, outputPath) {
    try {
        // Read the document content to be signed
        const document = fs.readFileSync(docPath, { encoding: 'utf-8' });

        // Read the private key from file
        const privateKey = fs.readFileSync(privateKeyPath, { encoding: 'utf-8' });

        // Create SHA256 signer for document signing
        const signer = createSign('SHA256');
        signer.update(document);
        signer.end();

        // Generate digital signature using RSA private key
        const signature = signer.sign({ key: privateKey, passphrase: 'topsecret' }, 'base64');

        // Save the signature to output file
        fs.writeFileSync(outputPath, signature);

        console.log('Document signed. Signature saved to:', outputPath);
    } catch (error) {
        console.error('Error signing document:', error);
    }
}

/**
 * Verify a document signature using RSA public key verification
 * Validates that the document hasn't been tampered with and signature is authentic
 * 
 * @param {string} docPath - Path to the original document file
 * @param {string} signaturePath - Path to the signature file
 * @param {string} certPath - Path to the public key certificate file
 * @returns {boolean} True if signature is valid, false otherwise
 */
function verifySignature(docPath, signaturePath, certPath) {
    try {
        // Read the original document content
        const document = fs.readFileSync(docPath, { encoding: 'utf-8' });

        // Read the signature file
        const signature = fs.readFileSync(signaturePath, { encoding: 'utf-8' });

        // Read the public key certificate
        const cert = fs.readFileSync(certPath, { encoding: 'utf-8' });

        // Create SHA256 verifier for signature validation
        const verifier = createVerify('SHA256');
        verifier.update(document);
        verifier.end();

        // Verify the signature against the public key
        const isValid = verifier.verify(cert, signature, 'base64');
        
        console.log('Signature is valid:', isValid);
        return isValid;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

/**
 * Main application function - CLI interface for blockchain operations
 * Handles command parsing, blockchain initialization, and command execution
 * Supports mining, validation, status checking, block queries, and document signing
 */
async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log("Usage:");
        console.log("  node app.mjs mine <private-key-file> <file1> <file2>");
        console.log("  node app.mjs validate");
        console.log("  node app.mjs block <block-hash>");
        console.log("  node app.mjs transaction <transaction-hash>");
        console.log("  node app.mjs sign <document-path> <private-key-path> <output-signature-path>");
        console.log("  node app.mjs verify <document-path> <signature-path> <certificate-path>");
        console.log("");
        console.log("Examples:");
        console.log("  node app.mjs mine 12345678-private.key testfile.txt test2file.json");
        console.log("  node app.mjs validate");
        console.log("  node app.mjs block 0000abc123...");
        console.log("  node app.mjs transaction abc123def456...");
        console.log("  node app.mjs sign document.txt private.key signature.sig");
        console.log("  node app.mjs verify document.txt signature.sig certificate.pem");
        process.exit(1);
    }

    const command = args[0];

    try {
        // Create blockchain instance
        const chain = new Blockchain();

        // Load existing blockchain state
        chain.loadBlockchainState();

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

            // Create transactions from files
            const tx1 = Transaction.fromFile({
                filename: file1Name,
                content: file1Content,
                signWithPrivateKeyPath: privateKeyPath
            });

            const tx2 = Transaction.fromFile({
                filename: file2Name,
                content: file2Content,
                signWithPrivateKeyPath: privateKeyPath
            });

            const result = chain.createAndMineBlock([tx1, tx2], 4);

        } else if (command === 'validate') {
            // Validation command
            const isValid = chain.isChainValid();

            if (isValid) {
                console.log("#".repeat(80));
                chain.blocks.forEach((block, idx) => {
                    console.log(`Block ${idx}: ${block.hash} valid`);
                });
                console.log("Blockchain is valid!");
                console.log("#".repeat(80));
                process.exit(0);
            } else {
                console.log("Blockchain is INVALID!");
                process.exit(1);
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
            console.log("#".repeat(80));
            console.log(`Block: ${block.hash}`);
            console.log(`Previous block: ${prevHash}`);
            console.log(`Transactions: ${block.transactions.length}`);

            block.transactions.forEach((tx, idx) => {
                console.log(`Transaction ${idx + 1}:`);
                console.log(`  - transaction_hash: ${tx.transaction_hash}`);
                
                // Display inputs
                tx.inputs.forEach((input, inputIdx) => {
                    if (input.file_data) {
                        console.log(`  - filename: ${input.file_data.filename}`);
                        console.log(`  - hash: ${input.file_data.file_hash}`);
                    }
                });
                
                
                if (tx.signature) console.log(`  - signature: ${tx.signature}`);
                if (tx.timestamp) console.log(`  - timestamp: ${new Date(tx.timestamp).toISOString()}`);
            });

            // Print other block info
            console.log(`Timestamp: ${new Date(block.timestamp).toISOString()}`);
            console.log(`Difficulty: ${block.difficulty !== undefined ? block.difficulty : chain.difficulty}`);
            console.log(`Nonce: ${block.nonce}`);
            console.log("#".repeat(80));
            process.exit(0);

        } else if (command === 'sign') {
            // Sign document command
            if (args.length < 4) {
                console.log("Usage: node app.mjs sign <document-path> <private-key-path> <output-signature-path>");
                process.exit(1);
            }

            const docPath = args[1];
            const privateKeyPath = args[2];
            const outputPath = args[3];

            // Check if files exist
            if (!fs.existsSync(docPath)) {
                console.error(`Error: Document ${docPath} does not exist`);
                process.exit(1);
            }
            if (!fs.existsSync(privateKeyPath)) {
                console.error(`Error: Private key file ${privateKeyPath} does not exist`);
                process.exit(1);
            }

            await signDocument(docPath, privateKeyPath, outputPath);

        } else if (command === 'verify') {
            // Verify signature command
            if (args.length < 4) {
                console.log("Usage: node app.mjs verify <document-path> <signature-path> <certificate-path>");
                process.exit(1);
            }

            const docPath = args[1];
            const signaturePath = args[2];
            const certPath = args[3];

            // Check if files exist
            if (!fs.existsSync(docPath)) {
                console.error(`Error: Document ${docPath} does not exist`);
                process.exit(1);
            }
            if (!fs.existsSync(signaturePath)) {
                console.error(`Error: Signature file ${signaturePath} does not exist`);
                process.exit(1);
            }
            if (!fs.existsSync(certPath)) {
                console.error(`Error: Certificate file ${certPath} does not exist`);
                process.exit(1);
            }

            verifySignature(docPath, signaturePath, certPath);

        } else if (command === 'transaction') {
            // Get specific transaction by hash
            if (args.length < 2) {
                console.log("Usage: node app.mjs transaction <transaction-hash>");
                process.exit(1);
            }

            const transactionHash = args[1];
            const transaction = chain.getTransactionByHash(transactionHash);

            if (!transaction) {
                console.log(`Transaction with hash ${transactionHash} not found.`);
                process.exit(1);
            }

            console.log("#".repeat(80));
            console.log(`Transaction: ${transaction.transaction_hash}`);
            console.log(`Valid Signature: ${transaction.isValid() ? 'Valid' : 'Invalid'}`);
            transaction.inputs.forEach((input, idx) => {
                if (input.file_data) {
                    console.log(`File name: ${input.file_data.filename}`);
                }
            });
            console.log(`Signature: ${transaction.signature}`);
            console.log(`Timestamp: ${new Date(transaction.timestamp).toISOString()}`);
            console.log("#".repeat(80));
        } else {
            console.log(`Unknown command: ${command}`);
            console.log("Available commands: mine, validate, block, transaction, sign, verify");
            process.exit(1);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();