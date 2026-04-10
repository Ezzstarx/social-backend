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
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9ae9?w=400&q=80",
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
    image: "https://images.unsplash.com/photo-1551269901-5c5e506549a8?w=400&q=80",
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
  }
];

const getAllStories = (req, res) => {
  const stories = STORIES.map(({ content, ...story }) => story);
  res.json(stories);
};

const getStory = (req, res) => {
  const storyId = Number(req.params.id);
  const story = STORIES.find((item) => item.id === storyId);

  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  res.json(story);
};

module.exports = { getAllStories, getStory };
