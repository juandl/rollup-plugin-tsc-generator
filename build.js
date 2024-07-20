const fs = require('fs');
const path = require('path');

const {transformFileSync} = require('@swc/core');


const CONFIG = {
    input: "src",
    output: "dist"
}

// Ensure the output directory exists
if (fs.existsSync(CONFIG.output)) {
    //Delete folder
    fs.rmSync(CONFIG.output, {recursive: true, force: true})

    //Create a new folder
    fs.mkdirSync(CONFIG.output);
} else {
    fs.mkdirSync(CONFIG.output);
}

// Function to transpile files
function transpileFiles(moduleType, extension) {
    const files = fs.readdirSync(CONFIG.input);

    files.forEach((file) => {
        const filePath = path.join(CONFIG.input, file);
        const outputPath = path.join(CONFIG.output, file.replace('.ts', extension));

        // Skip non-files (e.g., directories)
        if (fs.statSync(filePath).isFile() && file.endsWith('.ts')) {
            const result = transformFileSync(filePath, {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                    },
                },
                module: {
                    type: moduleType,
                },
            });

            fs.writeFileSync(outputPath, result.code);
        }
    });
}

// Transpile for CommonJS
transpileFiles('commonjs', '.js');

// Transpile for ES Modules
transpileFiles('es6', '.mjs');

console.log('Build completed.');
