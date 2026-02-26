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
            ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
            : null
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


const getCoverProxy = async (req, res) => {
  try {
    const { mangaId, fileName } = req.query;

    if (!mangaId || !fileName) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        Referer: "https://mangadex.org/",
        Origin: "https://mangadex.org",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );

    return res.send(response.data);

  } catch (error) {
    console.error("Cover proxy error:", error.message);
    return res.status(500).json({ message: "Failed to fetch image" });
  }
};

module.exports = { getMangaList, getCoverProxy };