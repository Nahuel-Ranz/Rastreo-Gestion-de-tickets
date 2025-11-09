const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const outputFile = path.join(rootDir, "project_tree.txt");

// Carpetas o archivos que NO querés incluir
const ignoreList = ["node_modules", ".git", "project_tree.txt"];

function generateTree(dir, depth = 0) {
    const indent = "    ".repeat(depth);
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Filtramos los ignorados
    const filtered = entries.filter(entry => !ignoreList.includes(entry.name));

    // Ordenamos: carpetas primero, luego archivos; ambos en orden descendente
    filtered.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        // Ambos son del mismo tipo → orden descendente alfabético
        return a.name.localeCompare(b.name);
    });

    let result = "";

    for (const entry of filtered) {
        const fullPath = path.join(dir, entry.name);
        const isDir = entry.isDirectory();

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
