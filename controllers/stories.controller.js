const mongoose = require("mongoose");
const Story = require("../models/Story");
const Chapter = require("../models/chapter");
const User = require("../models/User");

const STORIES = require("../extracted_stories.json");

async function ensureStoriesSeeded() {
  try {
    // Fix broken image URLs in existing stories
    const brokenUrlMap = {
      "https://images.unsplash.com/photo-1614728263952-84ea256f9ae9?w=400&q=80": "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
      "https://images.unsplash.com/photo-1551269901-5c5e506549a8?w=400&q=80": "https://images.unsplash.com/photo-1504192010706-dd7f569ee2be?w=400&q=80",
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      "https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=400&q=80": "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",
    };

    for (const [broken, fixed] of Object.entries(brokenUrlMap)) {
      await Story.updateMany({ coverImage: broken }, { coverImage: fixed });
    }

    const storiesCount = await Story.countDocuments({});
    if (storiesCount >= 15) {
      return;
    }

    console.log("Clearing existing stories to reseed...");
    await Story.deleteMany({});
    await Chapter.deleteMany({});

    console.log("🌱 Database stories are empty. Starting auto-seeding...");

    // 1. Ensure we have an author user
    let authorUser = await User.findOne({ role: "admin" });
    if (!authorUser) {
      authorUser = await User.findOne({});
    }
    if (!authorUser) {
      authorUser = await User.create({
        username: "system_author",
        email: "system_author@ezzstar.com",
        password: "systempassword123",
        role: "admin",
      });
      console.log(`👤 Created default system author: @${authorUser.username}`);
    }

    // 2. Seed stories and their chapters
    for (const data of STORIES) {
      // Create Story in MongoDB
      const storyDoc = await Story.create({
        title: data.title,
        coverImage: data.image,
        bannerImage: data.image,
        author: authorUser._id,
        description: data.about || "No description provided.",
        genres: data.genres || [data.genre],
        status: "ongoing",
        views: parseInt(String(data.views).replace(/[^0-9]/g, "")) || 0,
        subscribersCount: 120,
        likesCount: data.comments || 0,
        totalChapters: 5,
        rating: data.stars || 5,
        totalRatings: 1,
      });

      console.log(`📚 Seeded Story: ${storyDoc.title} (ID: ${storyDoc._id})`);

      // Seed 5 sample chapters/parts for each story to support multi-part reading
      for (let chNum = 1; chNum <= 5; chNum++) {
        let content = `This is chapter ${chNum} of ${storyDoc.title}.\n\n`;
        if (chNum === 1) {
          content = data.content;
        } else {
          content += `The story of ${storyDoc.title} continues in this second portion. Readers can explore the mounting tension as character arcs develop and the plot deepens in this exclusive release on Ezzstar.\n\nStay tuned for upcoming milestones and continue reading to accumulate daily XP and rewards!`;
        }

        await Chapter.create({
          story: storyDoc._id,
          title: `Part ${chNum}: ${chNum === 1 ? "The Call to Adventure" : "The Journey Continues"}`,
          chapterNumber: chNum,
          content: content,
          views: Math.floor(storyDoc.views / chNum),
          likesCount: Math.max(1, Math.floor(storyDoc.likesCount / chNum)),
          commentsCount: Math.max(1, Math.floor(storyDoc.likesCount / (chNum * 2))),
        });
      }
      console.log(`   - Seeded 5 chapters/parts for: ${storyDoc.title}`);
    }

    console.log("✅ Auto-seeding of stories and chapters completed successfully.");
  } catch (error) {
    console.error("❌ Failed to auto-seed stories:", error);
  }
}

const getAllStories = async (req, res) => {
  try {
    await ensureStoriesSeeded();
    const storiesList = await Story.find({}).populate("author", "username email");
    
    // Map MongoDB documents to the response format expected by the frontend
    const responseData = storiesList.map(story => ({
      id: story._id.toString(),
      image: story.coverImage,
      title: story.title,
      author: story.author?.username || "Aaron Campbell",
      genre: story.genres.join(", "),
      genres: story.genres,
      reward: "0.00005 SPCA",
      category: "Trending",
      views: story.views.toLocaleString(),
      stars: story.rating,
      comments: story.likesCount,
      writer: story.author?.username || "Pornsak Pichetshote",
      about: story.description,
      artist: story.author?.username || "Aaron Campbell",
    }));

    res.json(responseData);
  } catch (error) {
    console.error("Error in getAllStories:", error);
    res.status(500).json({ message: "Failed to fetch stories from database" });
  }
};

const getStory = async (req, res) => {
  try {
    await ensureStoriesSeeded();
    
    const storyId = req.params.id;
    let storyDoc = null;
    
    // Attempt to locate story by ObjectId
    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storyDoc = await Story.findById(storyId).populate("author", "username email");
    } else {
      // Graceful fallback for legacy numeric mock IDs during system transitions
      const numericId = Number(storyId);
      if (!isNaN(numericId) && numericId > 0 && numericId <= STORIES.length) {
        const foundData = STORIES[numericId - 1];
        if (foundData) {
          storyDoc = await Story.findOne({ title: foundData.title }).populate("author", "username email");
        }
      }
    }

    if (!storyDoc) {
      return res.status(404).json({ message: "Story not found in database" });
    }

    // Query chapters associated with the story from MongoDB Chapter collection
    const chapters = await Chapter.find({ story: storyDoc._id }).sort({ chapterNumber: 1 });
    
    // Map chapters to frontend parts
    const parts = chapters.map(ch => ({
      id: ch.chapterNumber,
      label: ch.title || `Part ${ch.chapterNumber}`,
      date: new Date(ch.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      stars: storyDoc.rating,
      comments: ch.commentsCount || 0,
      image: storyDoc.coverImage,
    }));

    // Read the query parameter for the requested chapter/part
    const partNum = Number(req.query.part) || 1;
    const activeChapter = chapters.find(ch => ch.chapterNumber === partNum) || chapters[0];

    const responseData = {
      id: storyDoc._id.toString(),
      image: storyDoc.coverImage,
      title: storyDoc.title,
      author: storyDoc.author?.username || "Aaron Campbell",
      genre: storyDoc.genres.join(", "),
      genres: storyDoc.genres,
      reward: "0.00005 SPCA",
      category: "Trending",
      views: storyDoc.views.toLocaleString(),
      stars: storyDoc.rating,
      comments: storyDoc.likesCount,
      writer: storyDoc.author?.username || "Pornsak Pichetshote",
      about: storyDoc.description,
      artist: storyDoc.author?.username || "Aaron Campbell",
      content: activeChapter?.content || storyDoc.description || "Story content coming soon.",
      parts: parts.length > 0 ? parts : [
        {
          id: 1,
          label: "Part 1",
          date: new Date(storyDoc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          stars: storyDoc.rating,
          comments: storyDoc.likesCount,
          image: storyDoc.coverImage,
        }
      ],
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in getStory:", error);
    res.status(500).json({ message: "Failed to fetch story details from database" });
  }
};

module.exports = { getAllStories, getStory };
