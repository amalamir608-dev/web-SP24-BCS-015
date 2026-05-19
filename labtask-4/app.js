const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const User = require("./models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Order = require("./models/order");


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
app.use(express.json());
app.use(session({

    secret: "nikeSecretKey",

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({

        mongoUrl: "mongodb://127.0.0.1:27017/nikeStore"

    })

}));

app.use(flash());

app.use((req, res, next) => {

    res.locals.currentUser = req.session.user;

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    next();

});

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

app.get("/admin",  isLoggedIn, isAdmin,async(req, res) => {

    try {
        const products = await Product.find();
        res.render("admin", { products });
    } 
    catch (err) {
        console.log(err);
        res.send("Error loading admin dashboard");
    }
});

app.get("/admin/add",  isLoggedIn, isAdmin, (req, res) => {

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

app.get("/admin/edit/:id",  isLoggedIn, isAdmin,async (req, res) => {

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

function isLoggedIn(req, res, next) {

    if(!req.session.user) {

        req.flash("error", "Please login first");

        return res.redirect("/login");

    }

    next();

}

function isAdmin(req, res, next) {

    if(req.session.user.role !== "admin") {

        req.flash("error", "Access Denied");

        return res.redirect("/");

    }

    next();

}
app.get("/register", (req, res) => {

    res.render("register");

});
app.post("/register", async (req, res) => {

    try {

        const existingUser = await User.findOne({

            email: req.body.email

        });

        if(existingUser) {

            req.flash("error", "Email already exists");

            return res.redirect("/register");

        }

        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );

        const newUser = new User({

            name: req.body.name,

            email: req.body.email,

            password: hashedPassword

        });

        await newUser.save();

        req.flash("success", "Registration successful");

        res.redirect("/login");

    }

    catch(err) {

        console.log(err);

        res.send("Error registering user");

    }

});



app.get("/login", (req, res) => {

    res.render("login");

});
app.post("/login", async (req, res) => {

    try {

        const user = await User.findOne({

            email: req.body.email

        });

        if(!user) {

            req.flash("error", "Invalid email");

            return res.redirect("/login");

        }

        const validPassword = await bcrypt.compare(

            req.body.password,

            user.password

        );

        if(!validPassword) {

            req.flash("error", "Invalid password");

            return res.redirect("/login");

        }

        req.session.user = user;

        req.flash("success", "Welcome back");

        res.redirect("/");

    }

    catch(err) {

        console.log(err);

        res.send("Error logging in");

    }

});
app.get("/logout", (req, res) => {

    req.session.destroy();

    res.redirect("/login");

});
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if(!authHeader) {

        return res.status(401).json({

            message: "Token Missing"

        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user = decoded;

        next();

    }

    catch(err) {

        return res.status(403).json({

            message: "Invalid Token"

        });

    }

}
app.post("/api/v1/auth/login", async (req, res) => {

    try {

        const user = await User.findOne({

            email: req.body.email

        });

        if(!user) {

            return res.status(401).json({

                message: "Invalid email"

            });

        }

        const validPassword = await bcrypt.compare(

            req.body.password,

            user.password

        );

        if(!validPassword) {

            return res.status(401).json({

                message: "Invalid password"

            });

        }

        const token = jwt.sign(

            {

                user_id: user._id,

                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "1h"

            }

        );

        res.json({

            token

        });

    }

    catch(err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});
app.get("/api/v1/products", async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;

        const limit = 8;

        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(limit);

        res.json(products);

    }

    catch(err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});
app.get("/api/v1/products/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        res.json(product);

    }

    catch(err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});
app.get("/api/v1/user/profile", verifyToken, async (req, res) => {

    try {

        const user = await User.findById(req.user.user_id)
            .select("-password");

        res.json(user);

    }

    catch(err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});
app.post("/api/v1/orders", verifyToken, async (req, res) => {

    try {

        const newOrder = new Order({

            user: req.user.user_id,

            products: req.body.products

        });

        await newOrder.save();

        res.status(201).json({

            message: "Order Created",

            order: newOrder

        });

    }

    catch(err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});