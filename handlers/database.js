const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Nasl-1:@Mobin1391@nasl-1.wat6o4b.mongodb.net/?appName=Nasl-1", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));
