const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));
