const fs = require('fs');

let inputFile = process.argv[2];
let outputFile = process.argv[3];
let multiplyBy = +process.argv[4];
let mode = process.argv[5];
let currMultiplyBy = 0;

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

    readFile();

} catch (err) {
    console.log('Error opening file: ' + err);
}

function readFile() {
    fs.readFile(inputFile, 'utf-8', (err, data) => {
        if (err) {
            console.log('Error reading file: ' + err);
        }

        if (mode === 'a') {
            return appendToFile(data);
        } else {
            if (currMultiplyBy > 0) {
                return appendToFile(data);
            } else {
                return writeToFile(data);
            }
        }
    });
}

function appendToFile(data) {
    fs.appendFile(outputFile, data, 'utf-8', (err) => {
        if (err) {
            console.log('Error writing to file: ' + err);
        }

        currMultiplyBy++;

        if (currMultiplyBy !== multiplyBy) {
            return readFile();
        }

        console.log('Finished');

        return;
    });
}

function writeToFile(data) {
    fs.writeFile(outputFile, data, 'utf-8', (err) => {
        if (err) {
            console.log('Error writing to file: ' + err);
        }

        currMultiplyBy++;

        if (currMultiplyBy !== multiplyBy) {
            return readFile();
        }

        console.log('Finished');

        return;
    });
}