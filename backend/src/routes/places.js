const express = require("express");
const router = express.Router();

router.get("/photo", async (req, res) => {
  try {
    const { placeId, maxwidth = "800", lat, lng, zoom = "16" } = req.query;

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return res.status(500).send("Missing GOOGLE_MAPS_API_KEY");

    const staticMapUrl = (mapLat, mapLng) =>
      "https://maps.googleapis.com/maps/api/staticmap" +
      `?center=${encodeURIComponent(mapLat)},${encodeURIComponent(mapLng)}` +
      `&zoom=${encodeURIComponent(zoom)}` +
      `&size=800x400` +
      `&markers=${encodeURIComponent(`${mapLat},${mapLng}`)}` +
      `&key=${encodeURIComponent(key)}`;

    const fallbackStatic = (fallbackLat = lat, fallbackLng = lng) => {
      if (!fallbackLat || !fallbackLng) {
        return res.status(404).send("No photo or location available");
      }

      return res.redirect(302, staticMapUrl(fallbackLat, fallbackLng));
    };

    if (!placeId) return fallbackStatic();

    const detailsUrl =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=photos,geometry` +
      `&key=${encodeURIComponent(key)}`;

    const detailsRes = await fetch(detailsUrl);
    const details = await detailsRes.json();

    const photoRef = details?.result?.photos?.[0]?.photo_reference;

    if (photoRef) {
      const photoUrl =
        "https://maps.googleapis.com/maps/api/place/photo" +
        `?maxwidth=${encodeURIComponent(maxwidth)}` +
        `&photo_reference=${encodeURIComponent(photoRef)}` +
        `&key=${encodeURIComponent(key)}`;

      return res.redirect(302, photoUrl);
    }

    const location = details?.result?.geometry?.location;
    if (location?.lat && location?.lng) {
      return fallbackStatic(location.lat, location.lng);
    }

    return fallbackStatic();
  } catch (err) {
    console.error(err);
    return res.status(404).send("Error loading location image");
  }
});

module.exports = router;
