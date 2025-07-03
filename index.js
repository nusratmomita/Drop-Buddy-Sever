const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config()

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1k8uoge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    // creating a collection
    const parcelCollection = client.db("DropBuddy").collection("parcels");

    // to show all the parcels
    app.get("/parcels" ,async(req,res)=>{
        const result = await parcelCollection.find().toArray();
        res.send(result);
    })

    // to create a new parcel
    app.post("/parcels" , async(req,res)=>{
        const addParcelData = req.body;
        const result = await parcelCollection.insertOne(addParcelData);
        res.send(result);        
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {}
}
run().catch(console.dir);


app.get('/' , (req,res)=>{
    res.send("DropBuddy server is running");
})

app.listen(port, ()=>{
    console.log(`DropBuddy server is running on port,${port}`);
})