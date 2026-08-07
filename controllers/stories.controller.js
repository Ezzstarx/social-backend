const mongoose = require("mongoose");
const Story = require("../models/Story");
const Chapter = require("../models/chapter");
const User = require("../models/User");

const STORIES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    title: "Infidel 1",
    author: "Aaron Campbell",
    genre: "Horror",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Horror", "Thriller"],
    views: "42,312",
    stars: 5,
    comments: 124,
    writer: "Pornsak Pichetshote",
    about: "A haunted house story for the 21st century, following an American Muslim woman and her neighbors in a building haunted by entities that feed on xenophobia.",
    artist: "Aaron Campbell",
    content: `Jim Caviezel, an American professor known for his vocal opposition to militant uprisings in the Middle East, had been invited to Cairo by an old friend, a fellow scholar. The invitation seemed innocent enough at first, a chance to speak out about the growing political unrest in the region. Little did Jim know, his visit would soon plunge him into a nightmare.

Upon arriving in Cairo, Jim's friend greeted him warmly, and they immediately began discussing the rising tensions in the country. The conversation, however, took a dark turn when Jim was ambushed by a group of armed men. Before he could react, they forced him into a black van, blindfolding him and taking him to an unknown location. His friend, who had appeared so genuine, was nowhere to be found. Jim was now a pawn in a game he did not understand.

Back in the United States, Jim's wife, Sarah, was preparing for a quiet weekend when the phone call came. Her heart sank as she listened to the news. Jim had been kidnapped in Cairo. The voice on the other end of the line, a frantic reporter, explained that Jim had been taken by a militant group. They believed he had information on the recent uprisings, and they wanted him to talk.

Sarah's world shattered. She knew Jim well enough to know that he would not give in to their demands. But the idea of him being held captive, possibly tortured, filled her with dread. She could not sit back and wait for someone else to save him. Sarah was determined. She was going to Cairo, no matter the cost.

With a heart full of fear and determination, Sarah packed her bags and booked the earliest flight to Egypt. She barely had time to think as she hurried through airport security, her mind racing. She knew nothing about the city, its dangers, or the political climate that had led to Jim's abduction. But what she did know was that she loved him, and she would not let him go without a fight.`
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    title: "H.G. Wells: The Science Fiction",
    author: "H.G. Wells",
    genre: "Sci-fi, Action, Mystery",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Sci-fi", "Action", "Mystery"],
    views: "31,204",
    stars: 5,
    comments: 87,
    writer: "H.G. Wells",
    about: "A collection of H.G. Wells science fiction stories reimagined for a modern audience with fresh artwork and narrative expansion.",
    artist: "H.G. Wells",
    content: `A collection of H.G. Wells science fiction stories is reimagined for a modern audience with bold new visuals and narrative framing.

Each chapter explores the collision between imagination, technology, and fear of the unknown, updating classic speculative fiction themes for a new generation of readers.`
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
    title: "Neon Silence",
    author: "K. Tanaka",
    genre: "Sci-fi, Action, Mystery",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Sci-fi", "Action", "Mystery"],
    views: "18,900",
    stars: 4,
    comments: 55,
    writer: "K. Tanaka",
    about: "In a city that never sleeps, one detective uncovers a conspiracy that reaches the highest levels of corporate power.",
    artist: "K. Tanaka",
    content: `In a city of endless rain and electric light, one detective follows a murder trail that points toward the boardrooms controlling the entire skyline.

What begins as a missing-person case becomes a fight against a machine built to erase inconvenient truths.`
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80",
    title: "A Cyberpunk Ghost Story",
    author: "S.S",
    genre: "Sci-fi, Action",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Sci-fi", "Action"],
    views: "22,450",
    stars: 5,
    comments: 63,
    writer: "S.S",
    about: "When the line between the digital and spiritual world dissolves, a hacker discovers her dead sister has been living inside the net.",
    artist: "S.S",
    content: `After a routine breach reveals an impossible signal, a hacker starts receiving messages from her dead sister through abandoned city infrastructure.

To uncover the truth, she must enter a digital underworld where grief, code, and memory are fused together.`
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1504192010706-dd7f569ee2be?w=400&q=80",
    title: "Crimson Tide",
    author: "L. Montgomery",
    genre: "Thriller, Mystery",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Thriller", "Mystery"],
    views: "14,320",
    stars: 4,
    comments: 41,
    writer: "L. Montgomery",
    about: "A former detective is pulled back into action when a series of murders mirrors a case she thought was solved a decade ago.",
    artist: "L. Montgomery",
    content: `A former detective is forced to reopen the darkest chapter of her past when fresh murders copy the exact signature of a killer she once stopped.

Every clue suggests the impossible: either the wrong person went away, or someone has learned how to mimic evil perfectly.`
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
    title: "Starborn",
    author: "C. Drake",
    genre: "Sci-fi, Fantasy",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Sci-fi", "Fantasy"],
    views: "27,800",
    stars: 5,
    comments: 92,
    writer: "C. Drake",
    about: "Born under a dying star, a young woman discovers she carries the power to either save or destroy the last remnants of humanity.",
    artist: "C. Drake",
    content: `Born under the final light of a collapsing sun, a young woman learns that an ancient force lives inside her bloodline.

As empires gather to control her fate, she must choose whether to become humanity's shield or its last catastrophe.`
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
    title: "Whispers in the Dark",
    author: "M. Rowe",
    genre: "Horror, Mystery",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Horror", "Mystery"],
    views: "9,870",
    stars: 4,
    comments: 33,
    writer: "M. Rowe",
    about: "Strange voices from the walls of an old asylum lead a journalist to the truth behind its most disturbing unsolved disappearances.",
    artist: "M. Rowe",
    content: `When a journalist investigates voices heard inside a sealed asylum wing, she uncovers a trail of disappearances hidden beneath decades of official silence.

Some stories were buried for a reason, and some walls are better left unopened.`
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80",
    title: "Beyond the Veil",
    author: "P. Castillo",
    genre: "Fantasy, Action",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Fantasy", "Action"],
    views: "35,100",
    stars: 5,
    comments: 110,
    writer: "P. Castillo",
    about: "A warrior priestess crosses into the realm of the dead to retrieve the soul of her fallen king, but the price may be her own.",
    artist: "P. Castillo",
    content: `A warrior priestess crosses into the land of the dead to recover the soul of her fallen king before a civil war consumes the living realm.

But each step beyond the veil demands a sacrifice, and the dead do not release what they claim without a price.`
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    title: "Into the Blue",
    author: "Emma Brodie",
    genre: "Contemporary Fiction",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Contemporary Fiction", "Romance"],
    views: "45,210",
    stars: 5,
    comments: 215,
    writer: "Emma Brodie",
    about: "A Love Story. Ten minutes before dress rehearsal, AJ Graves sat alone in the auditorium of the Hayes Theater, watching the stage lights rise...",
    artist: "Cassie Vu",
    content: `Ten minutes before dress rehearsal, AJ Graves sat alone in the auditorium of the Hayes Theater, watching the stage lights rise. Her head was full of ticking. Ten minutes. One more run-through, just them. Then the doors would open, and—

Tick, tick, tick, tick.

What was she going to do?

With a mechanized clink, the stage turned gold, and Noah Drew strode on carrying a prop chair. AJ stirred as his muscular, six foot three frame crossed center; he had such command, even when he wasn’t trying. He halted over a taped spike mark, his tousled black hair etched in light. He tried the chair this way then that, his expression so familiar it made AJ’s chest ache.`
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
    title: "Yesteryear",
    author: "Caro Claire Burke",
    genre: "Romance, Time Travel",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Romance", "Time Travel Romance"],
    views: "52,340",
    stars: 5,
    comments: 154,
    writer: "Caro Claire Burke",
    about: "This is the last day of the life I imagined for myself...",
    artist: "Caro Claire Burke",
    content: `This is the last day of the life I imagined for myself.

I woke up two minutes before my alarm went off, like usual. Five fifty-eight and bing: eyes wide open, ready to greet the day. I’ve never had a hard time waking up in the morning. Never used the snooze button, either, not once in my life. Sobriety helps. I don’t drink. Discipline helps, too. I was born with spades of discipline, I’m practically overflowing with it—which is why, I think, I’ve never had that much trouble with anything in my life. Not motherhood, nor marriage, nor building a business, nor serving Him. All of it appeared to me as a series of tasks to be accomplished each day, at the right time, in the correct chronological order. I know it’s not that easy for other people, but it really is for me.`
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
    title: "Starside",
    author: "Alex Aster",
    genre: "Romance, Fantasy",
    reward: "0.00005 SPCA",
    category: "Trending",
    genres: ["Romance", "Fantasy"],
    views: "67,800",
    stars: 5,
    comments: 245,
    writer: "Alex Aster",
    about: "A deadly competition called the Culling in a world split between the magic-rich realm of Starside and the struggling realm of Stormside.",
    artist: "Alex Aster",
    content: `This will kill me.

My sweaty palm curves around my dagger as I weave through the crowd of spectators. My blade is hidden up my sleeve, the sparkling metal cold against my pulse. One wrong move, and I’ll stab myself, but it’s better than having my weapon noticed this far from the front.

I lift to my toes to gauge my distance—and there it is.

The platform. A massive stone the size of a stage, black rock speckled with silver like a fallen slab of night. It’s beautiful, one of the last remaining shreds of magic on this side of a land halved.`
  }
];

// Helper to ensure database is seeded with mock stories if empty
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
    if (storiesCount > 0) {
      return;
    }

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
