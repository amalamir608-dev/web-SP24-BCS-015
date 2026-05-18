const mongoose = require("mongoose")
const Product = require("./models/product");

mongoose.connect("mongodb://127.0.0.1:27017/nikeStore")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

const sampleProducts = [
    {
        name: "Nike Air Max",
        price: 25000,
        category: "Shoes",
        rating: 4.5,
        stock: 10,
        image: "/images/air-max.png"
    },

    {
        name: "Nike Revolution",
        price: 18000,
        category: "Shoes",
        rating: 4.2,
        stock: 15,
        image: "/images/dunk.png"
    },

    {
        name: "Nike Hoodie",
        price: 12000,
        category: "Clothing",
        rating: 4.3,
        stock: 20,
        image: "/images/acg.png"
    },

    {
        name: "Nike Joggers",
        price: 9500,
        category: "Clothing",
        rating: 4.1,
        stock: 18,
        image:"/images/acg.png"
    },

    {
        name: "Nike Backpack",
        price: 7000,
        category: "Accessories",
        rating: 4.0,
        stock: 25,
        image:"/images/fan-gear.png"
    },

    {
        name: "Nike Cap",
        price: 3500,
        category: "Accessories",
        rating: 4.4,
        stock: 30,
        image:"/images/fan-gear.png"
    },

    {
        name: "Jordan Retro",
        price: 30000,
        category: "Shoes",
        rating: 4.8,
        stock: 8,
        image: "/images/vomero-5.png"
    },

    {
        name: "Nike Dri-FIT Shirt",
        price: 6000,
        category: "Clothing",
        rating: 4.2,
        stock: 22,
        image:"/images/acg.png"
    },

    {
        name: "Nike Socks",
        price: 2000,
        category: "Accessories",
        rating: 4.0,
        stock: 40,
        image:"/images/fan-gear.png"
    },

    {
        name: "Nike Pegasus",
        price: 22000,
        category: "Shoes",
        rating: 4.6,
        stock: 12,
        image:"/images/sabrina-3.png"
    },

    {
        name: "Nike Windrunner",
        price: 15000,
        category: "Clothing",
        rating: 4.5,
        stock: 10,
        image:"/images/acg.png"
    },

    {
        name: "Nike Training Tee",
        price: 5000,
        category: "Clothing",
        rating: 4.1,
        stock: 16,
        image:"/images/acg.png"
    },

    {
        name: "Nike Sports Bag",
        price: 8500,
        category: "Accessories",
        rating: 4.3,
        stock: 14,
        image:"/images/fan-gear.png"
    },

    {
        name: "Nike Slides",
        price: 4000,
        category: "Shoes",
        rating: 4.0,
        stock: 28,
        image:"/images/ava-rover.png"
    },

    {
        name: "Nike Court Vision",
        price: 17500,
        category: "Shoes",
        rating: 4.4,
        stock: 11,
        image:"/images/tatum-4.png"
    },

    {
        name: "Nike Sweatshirt",
        price: 11000,
        category: "Clothing",
        rating: 4.3,
        stock: 13,
        image:"/images/acg.png"
    },

    {
        name: "Nike Duffel Bag",
        price: 9000,
        category: "Accessories",
        rating: 4.5,
        stock: 9,
        image:"/images/fan-gear.png"
    },

    {
        name: "Nike Running Shorts",
        price: 5500,
        category: "Clothing",
        rating: 4.2,
        stock: 19,
        image:"/images/acg.png"
    },

    {
        name: "Nike Blazer",
        price: 21000,
        category: "Shoes",
        rating: 4.6,
        stock: 7,
        image:"/images/jordan-1.png"
    },

    {
        name: "Nike Everyday Backpack",
        price: 7800,
        category: "Accessories",
        rating: 4.1,
        stock: 17,
        image:"/images/fan-gear.png"
    }

];

async function seedDatabase() {
    try{
        await Product.deleteMany();
        await Product.insertMany(sampleProducts);
        console.log("Database Seeded");
        mongoose.connection.close();
    }

    catch (err) {
        console.log(err);
    }
}

seedDatabase();