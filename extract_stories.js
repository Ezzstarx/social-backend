const { execSync } = require('child_process');
const fs = require('fs');

const commits = [
  "f8c7bba", // The Mountain Is You
  "bd92cdb", // The Laws of Human Nature
  "580a60e", // Circe
  "ea21502", // Dungeon Crawler Carl
  "233a9c0", // The Silent Patient
  "82bda32", // My Husband's Wife
  "fea878c", // The Night We Met
  "774dc06", // The Iliad
  "855c01a", // The Odyssey
  "6944a32", // Red Rising
  "2f0dea7", // The Let Them Theory
  "14fa4da", // The Calamity Club
  "499e3e1", // Strangers
  "8672164", // Fourth Wing
  "3ca5564"  // The Correspondent
];

let allStories = [];
let idCounter = 1;

for (const commit of commits.reverse()) {
  try {
    const fileContent = execSync(`git show ${commit}:controllers/stories.controller.js`).toString();
    // Extract the STORIES array from the file content
    const match = fileContent.match(/const STORIES = (\[[\s\S]*?\]);\n\n\/\/ Helper/);
    if (match && match[1]) {
      // Use eval to parse the JS array (since it might have unquoted keys or backticks)
      const storiesArray = eval(match[1]);
      if (storiesArray.length > 0) {
        let story = storiesArray[0];
        story.id = idCounter++;
        allStories.push(story);
      }
    }
  } catch (err) {
    console.error(`Error at commit ${commit}: ${err.message}`);
  }
}

fs.writeFileSync('extracted_stories.json', JSON.stringify(allStories, null, 2));
console.log(`Extracted ${allStories.length} stories.`);
