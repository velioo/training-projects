const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const appendFileAsync = promisify(fs.appendFile);
const writeFileAsync = promisify(fs.writeFile);

let inputFile = process.argv[2];
let outputFile = process.argv[3];
let multiplyBy = +process.argv[4];
let mode = process.argv[5];
let currMultiplyBy = 0;

createFile();
console.log('sad');
async function createFile() {
    console.log('create');
    try {

        if (inputFile === undefined) {
            throw new Error('You must select an input file.');
        }

        if (outputFile === undefined) {
            throw new Error('You must give a name of the output file (existing or not). The selected file will be truncated if exists.');
        }

        if (multiplyBy === undefined) {
            throw new Error('You must select a number indicating how many time you want to multiply the input file size.');
        }

        if (isNaN(multiplyBy) && !Number.isInteger(multiplyBy)) {
            throw new Error('The number must be an integer.');
        }

        await readFile();

    } catch (err) {
        console.log('Error opening file: ' + err);
    }
}

async function readFile() {
    console.log('read');
    let data;

    await readFileAsync(inputFile, 'utf-8', (err, readData) => {
        if (err) {
            console.log('Error reading file: ' + err);
        }

        data = readData;
    });

    if (mode === 'a') {
        await appendToFile(data);
    } else {
        if (currMultiplyBy > 0) {
            await appendToFile(data);
        } else {
            await writeToFile(data);
        }
    }
}

async function appendToFile(data) {
    console.log('append');
    await appendFileAsync(outputFile, data, 'utf-8', (err) => {
        if (err) {
            console.log('Error writing to file: ' + err);
        }

        currMultiplyBy++;
    });

    if (currMultiplyBy !== multiplyBy) {
        await readFile();
    }
}

async function writeToFile(data) {
    console.log('data');
    await writeFileAsync(outputFile, data, 'utf-8', (err) => {
        if (err) {
            console.log('Error writing to file: ' + err);
        }

        currMultiplyBy++;
    });

    if (currMultiplyBy !== multiplyBy) {
        await readFile();
    }
}