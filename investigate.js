const mongoose = require("mongoose");
const Story = require("./models/Story");
const Chapter = require("./models/chapter");

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ezzstar");
  console.log("Connected to MongoDB");

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const oldStories = await Story.find({ createdAt: { $lt: oneWeekAgo } });
  const newStories = await Story.find({ createdAt: { $gte: oneWeekAgo } });

  console.log(`Found ${oldStories.length} old stories and ${newStories.length} new stories.`);

  // Let's check some chapter contents to identify what "dummy" means
  const sampleChapters = await Chapter.find().limit(5);
  console.log("\nSample Chapter contents:");
  for (const ch of sampleChapters) {
    console.log(`- Story ID: ${ch.story}, Ch ${ch.chapterNumber}: ${ch.content.substring(0, 100)}...`);
  }

  mongoose.disconnect();
}

run().catch(console.error);
