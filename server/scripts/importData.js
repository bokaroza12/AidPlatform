const axios = require("axios");
const mongoose = require("mongoose");
const { Item, Category, User, Request, Offer } = require("../models"); // Adjust the path as needed

const importData = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/aidPlatform_db");

    // Fetch data from the shared repository
    const response = await axios.get(
      "http://usidas.ceid.upatras.gr/web/2023/export.php"
    );
    const data = response.data;

    // Import categories
    await Category.deleteMany();
    const categories = data.categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.category_name,
    }));
    await Category.insertMany(categories);

    await Item.deleteMany();
    const items = data.items
      .map((item) => {
        const category = categories.find(
          (cat) => cat.categoryId === item.category
        );
        if (!item.name || !category) {
          console.warn(`Skipping invalid item: ${JSON.stringify(item)}`);
          return null;
        }
        return {
          itemId: item.id,
          name: item.name,
          category: item.category,
          details: item.details,
        };
      })
      .filter((item) => item !== null);
    await Item.insertMany(items);

    console.log("Data imported successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error importing data:", error);
    mongoose.connection.close();
  }
};

importData();
