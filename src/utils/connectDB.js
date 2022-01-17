const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Torvus:Torvus1407@abacus-22-cluster.puvnn.mongodb.net/Abacus_DB?retryWrites=true&w=majority", {
    useNewUrlParser : true,
    useUnifiedTopology: true
});