import fs from 'fs';

// Read the JSON file and return the parsed data synchronously
export function readJSONFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf-8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}
// console.log(readJSONFile()); // This line is for testing purposes