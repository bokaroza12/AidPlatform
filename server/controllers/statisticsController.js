const { Request, Offer } = require("../models");

exports.charts = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const newRequests = await Request.countDocuments({
      status: "pending",
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const newOffers = await Offer.countDocuments({
      status: "pending",
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const processedRequests = await Request.countDocuments({
      status: "completed",
      updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const processedOffers = await Offer.countDocuments({
      status: "completed",
      updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    res.json({
      dates: [new Date(startDate), new Date(endDate)],
      newRequests: [newRequests],
      newOffers: [newOffers],
      processedRequests: [processedRequests],
      processedOffers: [processedOffers],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
