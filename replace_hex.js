const fs = require('fs');
const files = ['app/staff/billets/page.tsx', 'app/client/page.tsx', 'app/client/billets/page.tsx'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/#0ea5e9/g, '#1C92FF');
    fs.writeFileSync(f, content);
  }
});
console.log('Replaces done');
