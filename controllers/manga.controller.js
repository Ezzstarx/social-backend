const axios = require("axios");

const getMangaList = async (req, res) => {
  try {
    const baseURL = "https://api.mangadex.org/manga";

    const params = {
      ...req.query,
      "includes[]": ["cover_art", "author", "artist"],
    };

    // Default content rating
    if (!req.query["contentRating[]"]) {
      params["contentRating[]"] = ["safe", "suggestive"];
    }

    const response = await axios.get(baseURL, { params });

    const data = response.data;

    // Add coverUrl
    const transformedData = {
      ...data,
      data: data.data.map((manga) => {
        const coverArt = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );

        const coverFileName = coverArt?.attributes?.fileName;

        return {
          ...manga,
          coverUrl: coverFileName
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
            : null,
        };
      }),
    };

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Manga API error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch manga",
      error: error.message,
    });
  }
};

module.exports = { getMangaList };