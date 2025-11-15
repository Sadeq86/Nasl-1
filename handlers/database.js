const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Aluxit:SadeqHosseini1387@aluxit.f5xgdpv.mongodb.net/?appName=Aluxit", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));
