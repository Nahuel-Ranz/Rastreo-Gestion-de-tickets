const fs = require("fs");
const path = require("path");

/* === CONFIGURACIÓN === */

// Carpeta que querés usar como raíz real del árbol:
const SOURCE_ROOT = "src";

// Carpeta absoluta donde está parado el usuario al ejecutar el script
const projectRoot = process.cwd();

// Ruta absoluta a la carpeta src/
const rootDir = path.join(projectRoot, SOURCE_ROOT);

// Archivo donde se escribirá el resultado
const outputFile = path.join(projectRoot, "project_tree.txt");

// Carpetas o archivos que NO querés incluir dentro de src/
const ignoreList = [
    "node_modules", ".git", "project_tree.txt", "generateProjectTree.js",
    "package.json", "package-lock.js", ".vscode", ".env", ".env.example"
];


/* === FUNCIÓN PARA GENERAR EL ÁRBOL === */

function generateTree(dir, depth = 0) {
    const indent = "    ".repeat(depth);
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const filtered = entries.filter(entry => !ignoreList.includes(entry.name));

    filtered.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;

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


/* === MAIN === */

function main() {
    if (!fs.existsSync(rootDir)) {
        console.error(`❌ ERROR: No existe la carpeta '${SOURCE_ROOT}/' en el proyecto.`);
        process.exit(1);
    }

    let tree = `> ${SOURCE_ROOT}/\n`;
    tree += generateTree(rootDir, 1);

    fs.writeFileSync(outputFile, tree, "utf-8");
    console.log(`✅ Estructura generada en ${outputFile}`);
}

main();