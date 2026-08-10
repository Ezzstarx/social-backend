const fs = require('fs');
const path = require('path');

const storiesData = fs.readFileSync('extracted_stories.json', 'utf8');
const stories = JSON.parse(storiesData);

// 2. Update Frontend (social-frontend/src/pages/Stories.jsx)
const frontendPath = path.join(__dirname, '..', 'social-frontend', 'src', 'pages', 'Stories.jsx');
let frontendContent = fs.readFileSync(frontendPath, 'utf8');

// Replace the MOCK_STORIES array
const frontendRegex = /const MOCK_STORIES = \[[\s\S]*?\];\n\n\/\* ── Helper/;
frontendContent = frontendContent.replace(frontendRegex, `const MOCK_STORIES = ${JSON.stringify(stories, null, 2)};\n\n/* ── Helper`);
fs.writeFileSync(frontendPath, frontendContent);
console.log('Updated frontend mock stories.');
