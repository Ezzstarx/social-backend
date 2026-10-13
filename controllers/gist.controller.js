let gistData = [
  {
    id: 1,
    author: "Kelly Wearstler",
    time: "about 1 hour ago",
    type: "Confession",
    title: "Will it be a sin to take Grandma Mildred's dress ornaments apart for jewelry?",
    replies: 18,
    views: "12,804",
    image: null,
    subscribed: false,
    stars: 45,
  },
  {
    id: 2,
    author: "Danish Javed",
    time: "2 hours ago",
    type: "Cosplay",
    title: "New Apex Legend cheat brings smurfing in low ranked lobbies to a whole new level",
    replies: 124,
    views: "42,312",
    image: "https://images.unsplash.com/photo-1605902711622-cfb43c44367f",
    subscribed: false,
    stars: 89,
  },
  {
    id: 3,
    author: "Mux Michel",
    time: "Just now",
    type: "Story",
    title: `"I'm your wife, not your mom." My wife says this a lot and I don’t know how to respond.`,
    replies: 67,
    views: "9,451",
    image: null,
    subscribed: true,
    stars: 12,
  },
  {
    id: 4,
    author: "Ava Thompson",
    time: "30 minutes ago",
    type: "Event",
    title: "Ezztar Social Event is coming soon — here’s what you should expect",
    replies: 52,
    views: "18,903",
    image: "https://images.unsplash.com/photo-1515169067865-5387ec356754",
    subscribed: false,
    stars: 211,
  },
  {
    id: 5,
    author: "Rohan Mehta",
    time: "3 hours ago",
    type: "Manga",
    title: "Blooming Love Chapter 1 discussion — did anyone catch that final panel detail?",
    replies: 89,
    views: "27,110",
    image: "https://wallpapers.com/images/high/cute-anime-profile-pictures-myg1ifdra7qohdks.webp",
    subscribed: true,
    stars: 34,
  },
  {
    id: 6,
    author: "Sophia Lee",
    time: "Yesterday",
    type: "Story",
    title: "I quit my job with no backup plan and it somehow worked out",
    replies: 203,
    views: "61,782",
    image: null,
    subscribed: false,
    stars: 412,
  },
  {
    id: 7,
    author: "Noah Williams",
    time: "5 hours ago",
    type: "Confession",
    title: "I pretend to understand crypto when my friends talk about it",
    replies: 41,
    views: "14,296",
    image: null,
    subscribed: false,
    stars: 18,
  },
  {
    id: 8,
    author: "Emily Carter",
    time: "6 hours ago",
    type: "Cosplay",
    title: "Rate my first League of Legends cosplay (be honest)",
    replies: 156,
    views: "38,440",
    image: "https://images.unsplash.com/photo-1611605698335-6f52c9b5d8c6",
    subscribed: true,
    stars: 199,
  },
  {
    id: 9,
    author: "Arjun Patel",
    time: "Today",
    type: "Event",
    title: "Community meetup recap — photos, highlights, and what we learned",
    replies: 33,
    views: "7,902",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    subscribed: false,
    stars: 56,
  },
  {
    id: 10,
    author: "Luna Rivers",
    time: "2 days ago",
    type: "Manga",
    title: "Top 5 underrated romance manga you should read this year",
    replies: 98,
    views: "45,670",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19",
    subscribed: true,
    stars: 134,
  },
];

let creatorsData = [
  { id: 1, name: "Mux Michel", threads: "112.45k", subscribed: false },
  { id: 2, name: "Danish Javed", threads: "89.2k", subscribed: true },
  { id: 3, name: "Kelly Wearstler", threads: "45.1k", subscribed: false },
  { id: 4, name: "Luna Rivers", threads: "23.8k", subscribed: false },
];

const getAllGists = (req, res) => {
  const { filter } = req.query;
  let result = [...gistData];

  if (filter === 'popular') {
    result.sort((a, b) => {
      const aViews = parseInt(a.views.replace(/,/g, '')) || 0;
      const bViews = parseInt(b.views.replace(/,/g, '')) || 0;
      const aScore = aViews + (a.replies * 10) + (a.stars * 50);
      const bScore = bViews + (b.replies * 10) + (b.stars * 50);
      return bScore - aScore;
    });
  } else if (filter === 'recent') {
    // Basic array reverse since time strings are complex to parse quickly
    result.reverse();
  } else if (filter === 'joined') {
    result = result.filter(g => g.subscribed);
  }

  res.status(200).json({ success: true, data: result });
};

const toggleJoinGist = (req, res) => {
  const { id } = req.params;
  const gist = gistData.find(g => g.id === parseInt(id));
  
  if (!gist) {
    return res.status(404).json({ success: false, message: 'Gist not found' });
  }

  gist.subscribed = !gist.subscribed;
  res.status(200).json({ success: true, data: gist });
};

const starGist = (req, res) => {
  const { id } = req.params;
  const gist = gistData.find(g => g.id === parseInt(id));
  
  if (!gist) {
    return res.status(404).json({ success: false, message: 'Gist not found' });
  }

  gist.stars += 1;
  res.status(200).json({ success: true, data: gist });
};

const getCreators = (req, res) => {
  res.status(200).json({ success: true, data: creatorsData });
};

const subscribeCreator = (req, res) => {
  const { id } = req.params;
  const creator = creatorsData.find(c => c.id === parseInt(id));
  
  if (!creator) {
    return res.status(404).json({ success: false, message: 'Creator not found' });
  }

  creator.subscribed = !creator.subscribed;
  res.status(200).json({ success: true, data: creator });
};

module.exports = {
  getAllGists,
  toggleJoinGist,
  starGist,
  getCreators,
  subscribeCreator,
};
