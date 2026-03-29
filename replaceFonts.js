const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend');

function replaceFonts(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            replaceFonts(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Replace Font Import Header
            content = content.replace(
                /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Syne:wght@400;600;700;800&family=DM\+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">/g,
                '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
            );

            content = content.replace(
                /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Syne:wght@400;600;700;800&family=DM\+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">/g,
                '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
            );

            // Replace CSS Font Families globally
            content = content.replace(/'Syne', sans-serif/g, "'Inter', sans-serif");
            content = content.replace(/'DM Sans', sans-serif/g, "'Inter', sans-serif");

            fs.writeFileSync(fullPath, content, 'utf8');
        }
    });
}

replaceFonts(targetDir);
console.log("Global Typography alignment to 'Inter' completed successfully.");
