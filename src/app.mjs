import Blockchain from "./blockchain/blockchain.mjs";
import { readJSONFile } from "./blockchain/readJSON.mjs";
// Need to: 
```
- Create transactions
- Create blocks
- Mine blocks
- Validate chain
- Process real blockchain data
```
const chain = new Blockchain();

// Load block data (string)
const blockData = readJSONFile('./src/datastore/data-to-mine.json');

// Mine with difficulty depend on number
const result = chain.mineBlock(blockData, 4);

function main() {
    console.log("Starting the blockchain application...");
}