const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./components'));
files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('teal')) {
    content = content.replace(/teal/g, 'highlight');
    fs.writeFileSync(f, content);
  }
});
console.log('Replaced all teal with highlight');
