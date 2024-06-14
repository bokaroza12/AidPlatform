const { Item, Category } = require("../models");

exports.getItems = async (req, res) => {
  const { category } = req.query;

  try {
    const query = category ? { category } : {};
    const items = await Item.find(query);
    const itemsWithCategory = await Promise.all(
      items.map(async (item) => {
        const category = await Category.findOne({ categoryId: item.category });
        return {
          ...item._doc,
          category: category ? category.categoryName : null,
        };
      })
    );
    res.json(itemsWithCategory);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.createItem = async (req, res) => {
  const { name, category, details } = req.body;

  try {
    const categoryExists = await Category.findOne({ categoryId: category });
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }
    const item = new Item({ name, category, details });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const { name, category, details } = req.body;
    if (name) item.name = name;
    if (category) item.category = category;
    if (details) item.details = details;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/itemController.js

exports.importData = async (req, res) => {
  try {
    const { items, categories } = req.body;

    // Validate and insert/update categories
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Invalid categories format" });
    }

    for (const cat of categories) {
      if (cat.id && cat.category_name) {
        await Category.updateOne(
          { categoryId: cat.id },
          { categoryId: cat.id, categoryName: cat.category_name },
          { upsert: true }
        );
      } else {
        console.warn(`Invalid category skipped: ${JSON.stringify(cat)}`);
      }
    }

    // Validate and insert/update items
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    for (const item of items) {
      if (
        item.id &&
        item.name &&
        item.category &&
        Array.isArray(item.details)
      ) {
        await Item.updateOne(
          { itemId: item.id },
          {
            itemId: item.id,
            name: item.name,
            category: item.category,
            details: item.details,
          },
          { upsert: true }
        );
      } else {
        console.warn(`Invalid item skipped: ${JSON.stringify(item)}`);
      }
    }

    res.status(200).json({ message: "Data imported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
