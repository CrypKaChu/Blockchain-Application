# Blockchain Assessment Project

A comprehensive blockchain implementation in JavaScript with proof-of-work mining, digital signatures, and transaction management.

## 🚀 Features

### Core Blockchain Functionality
- **Proof-of-Work Mining**: SHA256-based mining with configurable difficulty (default: 4 leading zeros)
- **Block Validation**: Complete blockchain integrity verification with special genesis block handling
- **Transaction Management**: File-based transactions with digital signatures
- **Data Persistence**: Automatic blockchain state saving and loading
- **Digital Signatures**: RSA-based document signing and verification

### CLI Commands
- `mine` - Create and mine blocks with file transactions
- `validate` - Verify entire blockchain integrity
- `block` - Display detailed block information
- `transaction` - Show specific transaction details
- `sign` - Sign documents with private key
- `verify` - Verify document signatures

## 📁 Project Structure

```
src/
├── app.mjs                 # Main CLI application
├── blockchain/
│   ├── blockchain.mjs     # Core blockchain implementation
│   ├── block.mjs          # Block class with mining
│   └── transaction.mjs    # Transaction class with signatures
├── datastore/
│   └── blockchain.json    # Persistent blockchain state
├── keys/                   # Cryptographic keys directory
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd my_blockchain

# Install dependencies (if any)
npm install
```

## 🚀 Usage

### Basic Commands

#### 1. Mining Blocks
Create and mine a new block with file transactions:
```bash
node src/app.mjs mine <private-key-file> <file1> <file2>
```

**Example:**
```bash
node src/app.mjs mine src/keys/private.key src/testfile.txt src/test2file.json
```

#### 2. Validate Blockchain
Verify the integrity of the entire blockchain:
```bash
node src/app.mjs validate
```

#### 3. View Block Details
Display detailed information about a specific block:
```bash
node src/app.mjs block <block-hash>
```

**Example:**
```bash
node src/app.mjs block 0000cdc62290d22d82ceec1ee9d7081d855da2a7b3e4b0977f77579935b4f063
```

#### 4. View Transaction Details
Show detailed information about a specific transaction:
```bash
node src/app.mjs transaction <transaction-hash>
```

**Example:**
```bash
node src/app.mjs transaction 72d73ea4c072b1fcb78f4aac468be87a166119460c8f5da6b991f2f2291304e7
```

#### 5. Sign Documents
Create digital signatures for documents:
```bash
node src/app.mjs sign <document-path> <private-key-path> <output-signature-path>
```

**Example:**
```bash
node src/app.mjs sign document.txt private.key signature.sig
```

#### 6. Verify Signatures
Verify digital signatures against documents:
```bash
node src/app.mjs verify <document-path> <signature-path> <certificate-path>
```

**Example:**
```bash
node src/app.mjs verify document.txt signature.sig certificate.pem
```
## 📊 Example Output

### Mining Output
```
##################################################
Block 1 Mined
Proof of work: 000066effe0eb493661cf4d2d2b96e3455dcdda0cbd3c993d6cf60b204ff3dbb at nonce 12345
Time taken: 2.34 seconds, starting at 2025-01-06T10:30:00.000Z, ending at 2025-01-06T10:30:02.340Z
Difficulty: 4
##################################################
```

## 🧪 Testing

### Validation Commands
```bash
# Validate entire blockchain
node src/app.mjs validate

# Check specific block
node src/app.mjs block <block-hash>

# Verify transaction
node src/app.mjs transaction <transaction-hash>
```

### Expected Results
- ✅ All blocks should show as "valid"
- ✅ Blockchain integrity should be maintained
- ✅ Transactions should have valid signatures
- ✅ Hash chaining should be consistent


## 🚀 Getting Started

1. **Navigate to the project directory**
2. **Run a mining operation**: `node src/app.mjs mine <key> <file1> <file2>`
3. **Validate the blockchain**: `node src/app.mjs validate`
4. **Explore blocks and transactions**: Use `block` and `transaction` commands

## 📄 License

This project is developed for educational assessment purposes.

---
