const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://hunger-help-net.web.app',
        'https://hunger-help-net.firebaseapp.com'
    ],
    credentials: true,
}))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qiowubl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const foodCollection = client.db('HungerHelpNetDB').collection('foodCollection');
const requestCollection = client.db('HungerHelpNetDB').collection('requestCollection');



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
      
      // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// -----------:: GET Operation ::----------------

app.get('/', (req, res) => {
    res.send('HungerHelpNet server is running')
})


app.get('/foods', async (req, res) => {
  try {

    const result = await foodCollection.find().toArray()

    
    res.send(result)
    
  } catch (error) {
    console.log('getting error from get /food', error);
  }
})


// -----------:: POST Operation ::----------------

app.post('/request-food', async (req, res) => {
  try {
    const foodRequest = req.body;
    const result = await requestCollection.insertOne(foodRequest)

    
    res.send(result)
    
  } catch (error) {
    console.log('getting error from post /request-food', error);
  }
})


app.post('/access-token', async (req, res) => {
  try {

    
  } catch (error) {
    console.log('getting error from post /access-token'. error);
  }
})

// -----------:: PUT Operation ::----------------



// -----------:: PATCH Operation ::----------------



// -----------:: DELETE Operation ::----------------

app.delete('/cancel-food/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await requestCollection.deleteOne(query)
    res.send(result)

  } catch (error) {
    console.log('getting error form delete /request-food/:id', error);
  }

})




app.listen(port, () => {
    console.log(`HungerHelpNet server is running on the port: ${port}`);
})