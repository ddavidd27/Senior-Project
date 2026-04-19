const express = require("express");
const router = express.Router();

router.get("/photo", async (req, res) => {
  try {
    const { placeId, maxwidth = "800", lat, lng, zoom = "16" } = req.query;

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return res.status(500).send("Missing GOOGLE_MAPS_API_KEY");

    const fallbackStatic = () => {
      if (!lat || !lng) {
        return res.redirect(
          302,
          "https://via.placeholder.com/800x400?text=No+photo+available"
        );
      }

      const staticUrl =
        "https://maps.googleapis.com/maps/api/staticmap" +
        `?center=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` +
        `&zoom=${encodeURIComponent(zoom)}` +
        `&size=800x400` +
        `&markers=${encodeURIComponent(`${lat},${lng}`)}` +
        `&key=${encodeURIComponent(key)}`;

      return res.redirect(302, staticUrl);
    };

    if (!placeId) return fallbackStatic();

    const detailsUrl =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=photos` +
      `&key=${encodeURIComponent(key)}`;

    const detailsRes = await fetch(detailsUrl);
    const details = await detailsRes.json();

    const photoRef = details?.result?.photos?.[0]?.photo_reference;
    if (!photoRef) return fallbackStatic();

    const photoUrl =
      "https://maps.googleapis.com/maps/api/place/photo" +
      `?maxwidth=${encodeURIComponent(maxwidth)}` +
      `&photo_reference=${encodeURIComponent(photoRef)}` +
      `&key=${encodeURIComponent(key)}`;

    return res.redirect(302, photoUrl);
  } catch (err) {
    console.error(err);
    return res.redirect(
      302,
      "https://via.placeholder.com/800x400?text=Error+loading+photo"
    );
  }
});

module.exports = router;