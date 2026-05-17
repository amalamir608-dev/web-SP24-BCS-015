const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product");

const app = express();
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/nikeStore")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});


app.set("view engine", "ejs");


app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/products", async (req,res) => {

    try  { 
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page -1) * limit;
        const search = req.query.search || "";
        const category = req.query.category || "";
        const minPrice = req.query.minPrice || "";
        const maxPrice = req.query.maxPrice || "";

        const min = Number(minPrice);
        const max = Number(maxPrice);

        if(min < 0 || max < 0){
            return res.send("Price cannot be negative");
        }

        if(maxPrice && minPrice && max <= min){
            return res.send("Maximum price must be greater than minimum price");
        }

        let query = {};

        if(search) {

            query.name = { $regex: search, $options: "i" };

        }

        if(category) {

            query.category = category;

        }

        if(minPrice || maxPrice) {

            query.price = {};

            if(minPrice) {

                query.price.$gte = Number(minPrice);

            }

            if(maxPrice) {

                query.price.$lte = Number(maxPrice);

            }

        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit);

        res.render("products", {
            products,
            currentPage: page,
            totalPages,
            search,
            category,
            minPrice,
            maxPrice
        });
    }

    catch (err)  {

        console.log(err);
        res.send("Error loading products");
    }
});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});