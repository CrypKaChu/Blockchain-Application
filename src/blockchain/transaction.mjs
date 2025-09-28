// File: transaction.mjs
import crypto from 'crypto';
import { readFileSync } from 'fs';

export default class Transaction {
    constructor(from, to, amount, timestamp = Date.now()) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = timestamp;
        this.signature = "";
    }

    signTransaction(transaction, privateKeyPath) {
        try {
            // Read the private key
            const privateKey = readFileSync(privateKeyPath, { encoding: 'utf-8' });
    
            // Create a signer object
            const signer = crypto.createSign('SHA256');
            signer.update(JSON.stringify(transaction));
            signer.end();
    
            // Sign the transaction
            const signature = signer.sign({ key: privateKey, passphrase: 'topsecret' }, 'base64');
    
            return signature;
        } catch (error) {
            console.error('Error signing transaction:', error);
        }
    }
    
    validateSignature(transaction, signature, publicKeyPath) {
        try {
    
            // Read the public key
            const publicKey = readFileSync(publicKeyPath, { encoding: 'utf-8' });
    
            // Create a verifier object
            const verifier = crypto.createVerify('SHA256');
            verifier.update(JSON.stringify(transaction));
            verifier.end();
    
            // Verify the signature
            return verifier.verify(publicKey, signature, 'base64');
        } catch (error) {
            console.error('Error validating signature:', error);
            return false;
        }
    }
}