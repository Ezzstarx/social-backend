const STORIES = [
  { id: 1, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80", title: "Infidel", author: "Aaron Campbell", genre: "Horror", reward: "0.00005 SPCA", category: "Trending", genres: ["Horror", "Thriller"], views: "42,312", stars: 5, comments: 124, writer: "Pornsak Pichetshote", about: "A Haunted House Story For The 21st Century, INFIDEL Follows An American Muslim Woman And Her Multi-Racial Neighbors Who Move Into A Building Haunted By Entities That Feed Off Xenophobia.", artist: "Aaron Campbell" },
  { id: 2, image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80", title: "H.G. Wells: The Science Fiction", author: "H.G. Wells", genre: "Sci-fi, Action, Mystery", reward: "0.00005 SPCA", category: "Trending", genres: ["Sci-fi", "Action", "Mystery"], views: "31,204", stars: 5, comments: 87, writer: "H.G. Wells", about: "A collection of the greatest science fiction works by H.G. Wells, reimagined for the modern age with stunning new artwork and narrative expansions.", artist: "H.G. Wells" },
  { id: 3, image: "https://images.unsplash.com/photo-1614728263952-84ea256f9ae9?w=400&q=80", title: "Neon Silence", author: "K. Tanaka", genre: "Sci-fi, Action, Mystery", reward: "0.00005 SPCA", category: "Trending", genres: ["Sci-fi", "Action", "Mystery"], views: "18,900", stars: 4, comments: 55, writer: "K. Tanaka", about: "In a city that never sleeps, one detective uncovers a conspiracy that reaches the highest levels of corporate power.", artist: "K. Tanaka" },
  { id: 4, image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80", title: "A Cyberpunk Ghost Story", author: "S.S", genre: "Sci-fi, Action", reward: "0.00005 SPCA", category: "Trending", genres: ["Sci-fi", "Action"], views: "22,450", stars: 5, comments: 63, writer: "S.S", about: "When the line between the digital and spiritual world dissolves, a hacker discovers her dead sister has been living inside the net.", artist: "S.S" },
  { id: 5, image: "https://images.unsplash.com/photo-1551269901-5c5e506549a8?w=400&q=80", title: "Crimson Tide", author: "L. Montgomery", genre: "Thriller, Mystery", reward: "0.00005 SPCA", category: "Trending", genres: ["Thriller", "Mystery"], views: "14,320", stars: 4, comments: 41, writer: "L. Montgomery", about: "A former detective is pulled back into action when a series of murders mirrors a case she thought she had solved a decade ago.", artist: "L. Montgomery" },
  { id: 6, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80", title: "Starborn", author: "C. Drake", genre: "Sci-fi, Fantasy", reward: "0.00005 SPCA", category: "Trending", genres: ["Sci-fi", "Fantasy"], views: "27,800", stars: 5, comments: 92, writer: "C. Drake", about: "Born under a dying star, a young woman discovers she carries the power to either save or destroy the last remnants of humanity.", artist: "C. Drake" },
  { id: 7, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80", title: "Whispers in the Dark", author: "M. Rowe", genre: "Horror, Mystery", reward: "0.00005 SPCA", category: "Trending", genres: ["Horror", "Mystery"], views: "9,870", stars: 4, comments: 33, writer: "M. Rowe", about: "Strange voices from the walls of an old asylum lead a journalist to the truth behind its most disturbing unsolved disappearances.", artist: "M. Rowe" },
  { id: 8, image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80", title: "Beyond the Veil", author: "P. Castillo", genre: "Fantasy, Action", reward: "0.00005 SPCA", category: "Trending", genres: ["Fantasy", "Action"], views: "35,100", stars: 5, comments: 110, writer: "P. Castillo", about: "A warrior priestess crosses into the realm of the dead to retrieve the soul of her fallen king — but the price may be her own.", artist: "P. Castillo" },
];
const STORY_CONTENT = `Jim Caviezel, an American professor known for his vocal opposition to militant uprisings in the Middle East, had been invited to Cairo by an old friend, a fellow scholar. The invitation seemed innocent enough at first, a chance to speak out about the growing political unrest in the region. Little did Jim know, his visit would soon plunge him into a nightmare.

Upon arriving in Cairo, Jim's friend greeted him warmly, and they immediately began discussing the rising tensions in the country. The conversation, however, took a dark turn when Jim was ambushed by a group of armed men. Before he could react, they forced him into a black van, blindfolding him and taking him to an unknown location. His friend, who had appeared so genuine, was nowhere to be found. Jim was now a pawn in a game he didn't understand.

Back in the United States, Jim's wife, Sarah, was preparing for a quiet weekend when the phone call came. Her heart sank as she listened to the news—Jim had been kidnapped in Cairo. The voice on the other end of the line, a frantic reporter, explained that Jim had been taken by a militant group. They believed he had information on the recent uprisings, and they wanted him to talk.

Sarah's world shattered. She knew Jim well enough to know that he wouldn't give in to their demands. But the idea of him being held captive, possibly tortured, filled her with dread. She couldn't sit back and wait for someone else to save him. Sarah was determined. She was going to Cairo, no matter the cost.

With a heart full of fear and determination, Sarah packed her bags and booked the earliest flight to Egypt. She barely had time to think as she hurried through airport security, her mind racing. She knew nothing about the city, its dangers, or the political climate that had led to Jim's abduction. But what she did know was that she loved him, and she wouldn't let him go without a fight.

Arriving in Cairo, Sarah was met with a chaotic city, streets crowded with people protesting against the government. She could feel the tension in the air, thick with anger and distrust. The last thing she wanted was to draw attention to herself, but she had no choice. Her first stop was the American embassy, hoping they could help. But even there, the officials seemed distant, overwhelmed by the growing unrest.

Sarah was not one to be easily deterred. She refused to accept the embassy's formalities and red tape. The security team provided her with some guidance, but it was clear they couldn't offer much help in a city so gripped by violence. She decided to take matters into her own hands. She knew that Jim was a man of principles, someone who would never give up easily. That meant, in her heart, she believed he was still alive.

Sarah's only lead was a few blurry details from the news reports and a cryptic message from Jim's colleague, who had last seen him before the abduction. The message mentioned something about a hidden safe house, a place where Jim might be held. Sarah's heart raced. The name of the place didn't ring any bells, but it was her only chance.

Without wasting any more time, Sarah hired a local guide to help her navigate the city's underground network. The guide, a man named Tariq, was cautious but willing to help. He had seen the aftermath of the uprisings firsthand and understood the gravity of the situation. The streets of Cairo were no longer safe, and many families had disappeared without a trace.

For the next several days, Sarah and Tariq scoured the city, asking questions, speaking to locals, and following any lead they could find. Everywhere they went, the tension in the city grew thicker. The protests continued, and there were reports of violent clashes between militants and the government forces. It seemed like Cairo was on the brink of collapse.

Meanwhile, Jim's captors were growing frustrated. They had expected him to break under pressure, to reveal what he knew about the uprisings and the movement behind them. But Jim, though bruised and exhausted, remained defiant. He refused to speak, refusing to betray his principles or reveal any information that might endanger others.

Days turned into weeks, and Sarah's hope began to waver. The city's political situation continued to worsen, making it harder for her to get close to Jim's captors. She had barely enough money left to stay in Cairo, and the danger was escalating by the hour. But Sarah knew that if she gave up now, she would lose Jim forever.

Then, one fateful night, Tariq received a call. The voice on the other end was familiar to him—one of his old contacts in the underground movement. The man mentioned a location—a rundown building near the outskirts of the city, a place known for housing captives. It wasn't much, but it was a lead Sarah couldn't ignore.

With renewed determination, Sarah set off with Tariq to the building. They approached cautiously, aware of the danger around them. The streets were eerily quiet, the city's chaos just beyond their reach. As they arrived at the location, Sarah felt a surge of adrenaline. She could feel Jim was near. He was so close, yet the danger surrounding them was palpable.`;
// GET all stories
const getAllStories = (req, res) => {
  res.json(STORIES);
};

// GET single story by ID
const getStory = (req, res) => {
  const story = STORY_CONTENT;
  
  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }
  res.json(story);
};

module.exports = { getAllStories, getStory };