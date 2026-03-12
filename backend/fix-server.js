const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
console.log(`Reading ${filePath}...`);

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // We want to stop exactly after the last closing brace of the unhandledRejection block
    // The good code ends with:
    // });

    // The corrupted code starts with / / ...

    const anchor = "// process.exit(1); // Don't crash for now, let it retry";
    const anchorIndex = content.lastIndexOf(anchor);

    if (anchorIndex !== -1) {
        console.log("Found anchor.");
        const closingBraceIndex = content.indexOf('});', anchorIndex);

        if (closingBraceIndex !== -1) {
            console.log("Found closing brace. Truncating file...");
            // Keep "});" which is 3 chars
            const cleanContent = content.substring(0, closingBraceIndex + 3);
            fs.writeFileSync(filePath, cleanContent);
            console.log("File fixed successfully!");
        } else {
            console.error("Could not find closing brace after anchor.");
        }
    } else {
        console.error("Could not find anchor text.");
    }
} catch (e) {
    console.error("Error fixing file:", e);
}
