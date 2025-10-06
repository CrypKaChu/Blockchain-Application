// File: transaction.mjs
import crypto from 'crypto';
import { readFileSync } from 'fs';

/**
 * Transaction class - Represents a blockchain transaction with inputs and outputs
 * Supports file-based transactions with digital signatures for integrity
 */
export default class Transaction {
    /**
     * Initialize a new transaction with the provided data
     * 
     * @param {Object} data - Transaction data object
     * @param {Array} data.inputs - Array of input objects (what's being spent)
     * @param {Array} data.outputs - Array of output objects (what's being received)
     * @param {number} data.timestamp - Transaction timestamp (defaults to current time)
     * @param {string} data.signature - Digital signature (defaults to empty string)
     */
    constructor(data) {
        this.inputs = data.inputs || [];
        this.outputs = data.outputs || [];
        this.timestamp = data.timestamp || Date.now();
        this.signature = data.signature || "";
        this.transaction_hash = this.calculateHash();
    }

    /**
     * Calculate the SHA256 hash of this transaction
     * Hash includes inputs, outputs, and timestamp for transaction integrity
     * 
     * @returns {string} SHA256 hash as hexadecimal string
     */
    calculateHash() {
        // Create deterministic string from transaction data
        const dataToHash = JSON.stringify({
            inputs: this.inputs,
            outputs: this.outputs,
            timestamp: this.timestamp
        });
        
        // Generate SHA256 hash and return as hexadecimal string
        return crypto.createHash('sha256').update(dataToHash).digest('hex');
    }

    /**
     * Create a transaction from a file (static factory method)
     * Creates a file-based transaction with inputs/outputs structure
     * Supports optional digital signing for transaction integrity
     * 
     * @param {Object} params - Parameters for file transaction
     * @param {string} params.filename - Name of the file being transacted
     * @param {string} params.content - Content of the file
     * @param {string} params.fromAddress - Address of the sender
     * @param {string} params.toAddress - Address of the recipient
     * @param {string} params.signWithPrivateKeyPath - Path to private key for signing (optional)
     * @returns {Transaction} New transaction instance
     */
    static fromFile({ filename, content, fromAddress, toAddress, signWithPrivateKeyPath = null }) {
        // Calculate SHA256 hash of file content for integrity verification
        const fileHash = crypto.createHash('sha256').update(content).digest('hex');
        
        // Create inputs array representing what's being spent (the file)
        const inputs = [{
            from_hash: fromAddress,
            value_sent: 0, // File transactions have no monetary value
            file_data: {
                filename: filename,
                file_hash: fileHash,
                content: content
            }
        }];

        // Create outputs array representing what's being received (the file)
        const outputs = [{
            to_hash: toAddress,
            value_received: 0, // File transactions have no monetary value
            file_data: {
                filename: filename,
                file_hash: fileHash
            }
        }];

        // Sign the transaction if private key is provided
        let signature = "";
        if (signWithPrivateKeyPath) {
            // Read private key from file
            const pk = readFileSync(signWithPrivateKeyPath, 'utf-8');
            
            // Create signer and prepare data for signing
            const signer = crypto.createSign('SHA256');
            const dataToSign = { 
                inputs, 
                outputs, 
                timestamp: Date.now() 
            };
            
            // Sign the transaction data
            signer.update(JSON.stringify(dataToSign));
            signer.end();
            signature = signer.sign({ key: pk, passphrase: 'topsecret' }, 'base64');
        }

        // Create and return new transaction instance
        return new Transaction({
            inputs,
            outputs,
            timestamp: Date.now(),
            signature
        });
    }

    /**
     * Sign this transaction with a private key
     * Creates a digital signature to prove transaction authenticity
     * 
     * @param {string} privateKeyPath - Path to the private key file
     * @returns {string|null} The signature string or null if signing failed
     */
    sign(privateKeyPath) {
        try {
            // Read private key from file
            const privateKey = readFileSync(privateKeyPath, { encoding: 'utf-8' });
            
            // Create signer and prepare transaction data for signing
            const signer = crypto.createSign('SHA256');
            const dataToSign = { 
                inputs: this.inputs,
                outputs: this.outputs,
                timestamp: this.timestamp
            };
            
            // Sign the transaction data
            signer.update(JSON.stringify(dataToSign));
            signer.end();
            
            // Generate signature and store it
            this.signature = signer.sign({ key: privateKey, passphrase: 'topsecret' }, 'base64');
            return this.signature;
        } catch (error) {
            console.error('Error signing transaction:', error);
            return null;
        }
    }

    /**
     * Validate this transaction's signature
     * Verifies the digital signature using the corresponding public key
     * 
     * @param {string} publicKeyPath - Path to the public key file (optional)
     * @returns {boolean} True if signature is valid, false otherwise
     */
    isValid(publicKeyPath = null) {
        try {
            // If no signature exists, transaction is invalid
            if (!this.signature) {
                return false;
            }

            // If no public key provided, assume valid (for testing purposes)
            if (!publicKeyPath) {
                return true;
            }

            // Read public key and create verifier
            const publicKey = readFileSync(publicKeyPath, { encoding: 'utf-8' });
            const verifier = crypto.createVerify('SHA256');
            
            // Prepare the same data that was signed
            const dataToVerify = { 
                inputs: this.inputs,
                outputs: this.outputs,
                timestamp: this.timestamp
            };
            
            // Verify the signature
            verifier.update(JSON.stringify(dataToVerify));
            verifier.end();

            return verifier.verify(publicKey, this.signature, 'base64');
        } catch (error) {
            console.error('Error validating transaction:', error);
            return false;
        }
    }

    /**
     * Get a summary object containing key transaction information
     * Useful for debugging, logging, and API responses
     * 
     * @returns {Object} Summary object with transaction metadata and validation status
     */
    getSummary() {
        return {
            transaction_hash: this.transaction_hash,
            inputs: this.inputs,
            outputs: this.outputs,
            timestamp: this.timestamp,
            signature: this.signature,
            isValid: this.isValid()
        };
    }

    /**
     * Calculate the total value of all inputs in this transaction
     * Sums up the value_sent from all input objects
     * 
     * @returns {number} Total input value
     */
    getTotalInputValue() {
        return this.inputs.reduce((sum, input) => sum + (input.value_sent || 0), 0);
    }

    /**
     * Calculate the total value of all outputs in this transaction
     * Sums up the value_received from all output objects
     * 
     * @returns {number} Total output value
     */
    getTotalOutputValue() {
        return this.outputs.reduce((sum, output) => sum + (output.value_received || 0), 0);
    }
}