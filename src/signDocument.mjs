import { readFileSync, promises as fsPromises } from 'fs';
import { createSign, createVerify } from 'crypto';



async function signDocument(docPath, privateKeyPath, outputPath) {
    try {
        // Read the document to be signed
        const document = await fsPromises.readFile(docPath, { encoding: 'utf-8' });

        // Read the private key
        const privateKey = readFileSync(privateKeyPath, { encoding: 'utf-8' });

        // Create a signer object
        const signer = createSign('SHA256');
        signer.update(document);
        signer.end();

        // Sign the document
        const signature = signer.sign({ key: privateKey, passphrase: 'topsecret' }, 'base64');

        // Save the signature to a file
        await fsPromises.writeFile(outputPath, signature);

        console.log('Document signed. Signature saved to:', outputPath);
    } catch (error) {
        console.error('Error signing document:', error);
    }
}

function verifySignature(docPath, signaturePath, certPath) {
    try {
        // Read the document
        const document = readFileSync(docPath, { encoding: 'utf-8' });

        // Read the signature
        const signature = readFileSync(signaturePath, { encoding: 'utf-8' });

        // Read the public key from the certificate
        const cert = readFileSync(certPath, { encoding: 'utf-8' });

        // Create a verifier object
        const verifier = createVerify('SHA256');
        verifier.update(document);
        verifier.end();

        // Verify the signature
        const isValid = verifier.verify(cert, signature, 'base64');
        
        console.log('Signature is valid:', isValid);
    } catch (error) {
        console.error('Error verifying signature:', error);
    }
}

// Command line arguments handling
const args = process.argv.slice(2);

if (args[0] === 'sign') {
    // Example: node signDocument.js sign document.txt private.pem signature.sig
    if (args.length !== 4) {
        console.log('Usage: node signDocument.js sign <document path> <private key path> <output signature path>');
    } else {
        signDocument(args[1], args[2], args[3]);
    }
} else if (args[0] === 'verify') {
    // Example: node signDocument.js verify document.txt signature.sig certificate.pem
    if (args.length !== 4) {
        console.log('Usage: node signDocument.js verify <document path> <signature path> <certificate path>');
    } else {
        verifySignature(args[1], args[2], args[3]);
    }
} else {
    console.log('Invalid command. Use "sign" to sign a document or "verify" to verify a document.');
}
