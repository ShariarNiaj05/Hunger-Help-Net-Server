const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())



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


const verify = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).send({ message: 'Your are not authorized' })
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Your are not authorized' })
    }
    req.user = decoded
    next()
  })
}



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

    let query = {}
    let sortObj = {}
    const foodName = req.query.foodName;
    const sortField = req.query.sortField;
    const sortOrder = req.query.sortOrder;

    if (foodName) {
      query.foodName = foodName
    }

    if (sortField && sortOrder) {
      sortObj[sortField] = sortOrder
    }

    const result = await foodCollection.find(query).sort(sortObj).toArray()


    res.send(result)

  } catch (error) {
    console.log('getting error from get /food', error);
  }
})


app.get('/foods/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await foodCollection.findOne(query)
  res.send(result)
})


// user specific getting food 
app.get('/get-food', verify, async (req, res) => {
  try {
    const queryEmail = req.query.queryEmail;
    const tokenEmail = req.user.email;

    console.log('sdfaf',tokenEmail);
   

    if (queryEmail !== tokenEmail) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }

    let query = {}
    if (queryEmail) {
      query.email = queryEmail
    }

    const result = await foodCollection.find(query).toArray()

    


    res.send(result)
  } catch (error) {
    console.log('getting error from post /request-food', error);
  }
})

app.get('/get-food/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}

  const result = await foodCollection.findOne(query)
  console.log(result);
  res.send(result)
})


// -----------:: POST Operation ::----------------

app.post('/add-food', async (req, res) => {
  try {
    const addFood = req.body;
    const result = await foodCollection.insertOne(addFood)
    res.send(result)
    
  } catch (error) {
    console.log('getting error from post /add-food', error);
    
  }
})

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
      const user = req.body
      console.log('user from post /access-token',user);
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: 360000000 })
      res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
      }).send({ success: true })
  } catch (error) {
      console.log('getting error from post /auth/access-token', error);
  }
})

// -----------:: PUT Operation ::----------------



// -----------:: PATCH Operation ::----------------



// -----------:: DELETE Operation ::----------------

app.delete('/cancel-food/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await requestCollection.deleteOne(query)
    res.send(result)

  } catch (error) {
    console.log('getting error form delete /request-food/:id', error);
  }

})




app.listen(port, () => {
  console.log(`HungerHelpNet server is running on the port: ${port}`);
})