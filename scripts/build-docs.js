const fs = require('fs')
const path = require('path')

const srcDir = path.resolve(__dirname, '../docs/src')
const output = path.resolve(__dirname, '../docs/maps.md')

const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
const content = files
    .map((f) => fs.readFileSync(path.join(srcDir, f), 'utf8'))
    .join('')
    .replace(/\.\.\/resources\/images\//g, 'resources/images/')

fs.writeFileSync(output, content)
console.log('Built docs/maps.md')
