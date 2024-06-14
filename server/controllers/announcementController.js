const { Announcement, Item } = require("../models");

exports.createAnnouncement = async (req, res) => {
  const { title, message, requiredItems } = req.body;

  try {
    const items = await Promise.all(
      requiredItems.map(async (requiredItem) => {
        const item = await Item.findById(requiredItem.item);
        return { item: item._id, name: item.name };
      })
    );

    const newAnnouncement = new Announcement({
      title,
      message,
      requiredItems: items,
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate(
      "requiredItems.item"
    );
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
