var express = require("express");
const http = require('http');
const {Server}  =require("socket.io");

var mongoose=require("mongoose")
const grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const multer = require('multer');
const { Console } = require("console");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});
const port =2410;

const MongoClient = require('mongodb').MongoClient;
mongoose.connect('mongodb+srv://mdsheikh6234:Nafish%4014@cluster0.fko8vta.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Replace the URL and collection name with your own values
const uri = 'mongodb+srv://mdsheikh6234:Nafish%4014@cluster0.fko8vta.mongodb.net/';

const client = new MongoClient(uri);
// Get the default connection
const conn = mongoose.connection;

// // Create the GridFS connection
// grid.mongo = mongoose.mongo;
let gfs, gridfsBucket;



const server=http.createServer(app)


const io = new Server(9000, {
  cors:
  {
  origin: 'https://whatsapp-clone-c654f.web.app',
    methods:["GET","POST"] 
  }
  }
  )

  io.on("connection", (socket) => { 
      console.log(`user connected:' ${socket.id}`);
      socket.on('sendMessage', data => {
        const now = new Date(); 
        let day = now.getDate();
       let month = now.getMonth() + 1;
       let year = now.getFullYear();
       const hours=now.getHours()
       let currentDate = `${day}-${month}-${year}`;
        var ampm = hours >= 12 ? 'pm' : 'am';
        const hoursAndMinutes = now.getHours() + ':'+(now.getMinutes()<10?'0':'') + now.getMinutes()+ " " +ampm;
        let arr={...data,timestamps: hoursAndMinutes,date:currentDate}
     console.log('sendMessage',arr)
     socket.broadcast.emit("getMessage",arr)
  })
  })







conn.once('open', () => {
 
  
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'fs'
  });
  ;
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection('fs');

});

const storage = new GridFsStorage({
  url: uri,
  options: { useNewUrlParser: true },
  file: (request, file) => {
      const match = ["image/png", "image/jpg"];

      if(match.indexOf(file.memeType) === -1) 
          return`${Date.now()}-blog-${file.originalname}`;

      return {
          bucketName: "photos",
          filename: `${Date.now()}-blog-${file.originalname}`
      }
  }
});

async function  connectToDB(){
  try {
    await client.connect();
    console.log('Connected to MongoDB!');


  } catch (err) {
    console.error(err);
  }
}




app.post('/login',async(req,res) => {
 const body =req.body

  const collection = client.db('whatsapp').collection('user')
  const documents = await collection.findOne({email:body.email})
  // documents===undefined|| documents===null?await collection.insertOne(body):""
console.log(documents)
const adduser =(documents, socketId) =>{
  !users.some(user => user.sub ==documents.sub) && users.push({...documents, socketId });
  Console.log("socketId",socketId)
  }
console.log(body)

  res.send(documents)

  
  
 
})
const upload = multer({ storage });


app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(404).json("File not found");

  const imageUrl = `https://mypotal-com.onrender.com/file/${file.filename}`;

  res.status(200).json(imageUrl);
});
app.get('/file/:filename',async (request, res) => {
  try {   
    const file = await gfs.collection("fs").findOne({ filename: request.params.filename });
     console.log(file)
    const readStream = gridfsBucket.openDownloadStream(file._id);

    readStream.pipe(res);
   
} catch (error) {
    res.status(500).json({ msg: error.message });
}
});
app.post('/chat',async(req,res) => {
 const body =req.body
 console.log(body)
  const collection = client.db('whatsapp').collection('conversation')
  // await collection.findOne({senderId:body.senderId,reciverId:body.reciverId})
  // documents===undefined||documents==null?

  const now = new Date(); 
   let day = now.getDate();
  let month = now.getMonth() + 1;
  let year = now.getFullYear();
  let currentDate = `${day}-${month}-${year}`;
  const hours=now.getHours()
  var ampm = hours >= 12 ? 'pm' : 'am';
const hoursAndMinutes = now.getHours() + ':'+(now.getMinutes()<10?'0':'') + now.getMinutes()+ " " +ampm;
const documents =await collection.insertOne({Id:[body.senderId,body.receiverId],...body, timestamps: hoursAndMinutes,date:currentDate})
var currentDate1 = "22-5-2023";
var fallbackDate = "22rs-5-2023";

const documents1 =await collection.updateMany(
  { date: { $exists: false } },
  { $set: { date: fallbackDate } }
)

 
  // console.log(documents1)
  // console.log(currentDate)
  // console.log(hoursAndMinutes)
 
  res.send({Id:[body.senderId,body.receiverId],...body, timestamps: hoursAndMinutes,date:currentDate})

  
  
 
})
app.post('/file',async(req,res) => {
 const body =req.body

  const collection = client.db('whatsapp').collection('conversation')
  // await collection.findOne({senderId:body.senderId,reciverId:body.reciverId})
  // documents===undefined||documents==null?

  const now = new Date();

const hoursAndMinutes = now.getHours() + ':'+(now.getMinutes()<10?'0':'') + now.getMinutes();
const documents =await collection.insertOne({Id:[body.senderId,body.receiverId],...body, timestamps: hoursAndMinutes})
  
  
 
  res.send(body)

  
  
 
})
app.get('/chat/:id/:id1',async(req,res) => {
 const id =req.params.id
 const id1 =req.params.id1

  const collection = client.db('whatsapp').collection('conversation')
// const documents =  await collection.find({senderId:id,receiverId:id1}).toArray()
const data=await collection.find({Id:{$all:[id1,id]}}).toArray()
//   console.log(documents)
  
//  let d2=[...documents,...data]
  res.send(data)

  
  
 
})
app.get('/file/:id/:id1',async(req,res) => {
 const id =req.params.id
 const id1 =req.params.id1

  const collection = client.db('whatsapp').collection('conversation')
// const documents =  await collection.find({senderId:id,receiverId:id1}).toArray()
const data=await collection.find({Id:{$all:[id1,id]}}).toArray()
//   console.log(documents)

//  let d2=[...documents,...data]
  res.send(data)

  
  
 
})
app.get('/login',async(req,res) => {

  const collection = client.db('whatsapp').collection('user')
  const documents = await collection.find().toArray()
 
  res.send(documents)

})



app.listen(port, () => console.log(`Node app listening on port ${port}!`));

