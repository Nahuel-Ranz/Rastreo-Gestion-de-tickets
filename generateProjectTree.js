const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const outputFile = path.join(rootDir, "project_tree.txt");

// Carpetas o archivos que NO querés incluir
const ignoreList = ["node_modules", ".git", "project_tree.txt"];

function generateTree(dir, depth = 0) {
    const indent = "    ".repeat(depth);
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    let result = "";

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const isDir = entry.isDirectory();

        // Ignorar carpetas/archivos innecesarios
        if (ignoreList.includes(entry.name)) continue;

        if (isDir) {
            result += `${indent}> ${entry.name}/\n`;
            result += generateTree(fullPath, depth + 1);
        } else {
            result += `${indent}. ${entry.name}\n`;
        }
    }

    return result;
}

function main() {
    let tree = "> root/\n";
    tree += generateTree(rootDir, 1);

    fs.writeFileSync(outputFile, tree, "utf-8");
    console.log(`✅ Estructura generada en ${outputFile}`);
}

main();