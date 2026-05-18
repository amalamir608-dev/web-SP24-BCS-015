const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product");
const multer = require("multer");



const app = express();
const storage = multer.diskStorage({
    destination: function(req, file, cb) {

        cb(null, "public/uploads");

    },

    filename: function(req, file, cb) {

        cb(null, Date.now() + "-" + file.originalname);

    }

});

const upload = multer({ storage: storage });
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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
        const categories = await Product.distinct("category");
        res.render("products", {
            products,
            categories,
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

app.get("/admin", async(req, res) => {

    try {
        const products = await Product.find();
        res.render("admin", { products });
    } 
    catch (err) {
        console.log(err);
        res.send("Error loading admin dashboard");
    }
});

app.get("/admin/add", (req, res) => {

    res.render("addProduct");

});

app.post("/admin/add", upload.single("image"), async (req, res) => {

    try {

        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            rating: req.body.rating,
            stock: req.body.stock,
            image: "/uploads/" + req.file.filename

        });

        await newProduct.save();

        res.redirect("/admin");

    }

    catch (err) {

        console.log(err);

        res.send("Error adding product");

    }

});

app.post("/admin/delete/:id", async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.redirect("/admin");

    }

    catch (err) {

        console.log(err);

        res.send("Error deleting product");

    }

});

app.get("/admin/edit/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        res.render("editProduct", { product });

    }

    catch (err) {

        console.log(err);

        res.send("Error loading edit page");

    }

});

app.post("/admin/edit/:id", upload.single("image"), async (req, res) => {

    try {
        
    const updatedData = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    rating: req.body.rating,
    stock: req.body.stock

};

if(req.file) {

    updatedData.image = "/uploads/" + req.file.filename;

}

await Product.findByIdAndUpdate(
    req.params.id,
    updatedData
);

        res.redirect("/admin");

    }

    catch (err) {

        console.log(err);

        res.send("Error updating product");

    }

});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});