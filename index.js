const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { default: Stripe } = require('stripe');
const port = process.env.PORT || 3000;
require('dotenv').config()

const app = express();

const stripe = require('stripe').Stripe(process.env.PAYMENT_GATEWAY_KEY);

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

    // to get parcel for specific user or all
    app.get("/parcels/email" , async(req,res)=>{
        const email = req.query.email;
        const query = email ? {user_email: email} : {};

        const sorting = {
            sort : {creation_date: -1}
        }

        const result = await parcelCollection.find(query,sorting).toArray();
        res.send(result);
    });

    // to get a specific parcel by id
    app.get("/parcels/:id" , async(req,res)=>{
      const id = req.params.id;
      const query = ( { _id: new ObjectId(id) });

      const result = await parcelCollection.findOne(query);
      res.send(result)
    })

    // to delete a parcel
    app.delete("/parcels/:id" , async(req,res)=>{
      const id = req.params.id;

      const result = await parcelCollection.deleteOne( { _id : new ObjectId(id) });
      res.send(result); 

    });

    // to integrate payment method
    // * whose is going to receive the payment we check here
    app.post("/parcels/create-payment-intent" , async(req,res)=>{

      const amountInCents = req.body.totalCostInCents;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      // !! did not understand this part. ask chatGPT about all this[take frontend code too]
      res.send( {clientSecret: paymentIntent.client_secret} )
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