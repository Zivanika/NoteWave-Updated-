const connectToMongo=require("./db")
var cors=require("cors")
connectToMongo();
const express = require('express')
const app = express() 
const port = 5000
app.use(cors())
app.use(express.json()) //app.use(express.json()): This line adds the express.json() middleware to the Express application. By using app.use() with express.json(), you're instructing Express to parse JSON data in the request bodies of incoming requests. This is particularly useful when your API endpoints expect JSON data to be sent in requests.
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`NoteWave backend listening on port ${port}`)
})