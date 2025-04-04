const safeBrowsing = require("../services/safeBrowsing");

exports.detectPhishing = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const isPhishing = await safeBrowsing.checkURL(url);

        res.json({
            url,
            isPhishing,
            message: isPhishing ? "Warning! This URL is unsafe." : "This URL is safe."
        });
    } catch (error) {
        res.status(500).json({ error: "Error checking URL safety" });
    }
};
