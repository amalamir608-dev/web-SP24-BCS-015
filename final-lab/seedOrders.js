const mongoose = require("mongoose");

const Order = require("./models/order");

const Product = require("./models/product");

const User = require("./models/user");

mongoose.connect("mongodb://127.0.0.1:27017/nikeStore")
.then(() => {

    console.log("MongoDB Connected");

})
.catch((err) => {

    console.log(err);

});

async function seedOrders() {

    try {

        await Order.deleteMany();

        const user = await User.findOne();

        const products = await Product.find();

        if(!user || products.length < 3) {

            console.log("Not enough users or products");

            return;

        }

        const sampleOrders = [

            {

                user: user._id,

                products: [

                    {

                        product: products[0]._id,

                        quantity: 2

                    },

                    {

                        product: products[1]._id,

                        quantity: 1

                    }

                ]

            },

            {

                user: user._id,

                products: [

                    {

                        product: products[0]._id,

                        quantity: 3

                    },

                    {

                        product: products[2]._id,

                        quantity: 2

                    }

                ]

            },

            {

                user: user._id,

                products: [

                    {

                        product: products[1]._id,

                        quantity: 4

                    }

                ]

            }

        ];

        await Order.insertMany(sampleOrders);

        console.log("Orders Seeded");

        mongoose.connection.close();

    }

    catch(err) {

        console.log(err);

    }

}

seedOrders();