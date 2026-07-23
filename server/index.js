require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const store = require("./store");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());


// Broadcast updated queue state
async function broadcastState() {
  try {
    const state = await store.publicState();
    io.emit("state", state);
  } catch (err) {
    console.error("Broadcast failed:", err);
  }
}



// ================= REST API =================


// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "DAR Queue API Running"
  });
});



// Get complete queue state
app.get("/api/state", async (_req, res) => {

  try {

    const state = await store.publicState();

    res.json(state);

  } catch(err){

    res.status(500).json({
      error: err.message
    });

  }

});




// Create ticket
app.post("/api/tickets", async (req,res)=>{

  try {

    const ticket = await store.createTicket(req.body);

    await broadcastState();

    res.status(201).json(ticket);


  } catch(err){

    res.status(400).json({
      error: err.message
    });

  }

});




// Call next ticket
app.post("/api/tickets/call-next", async(req,res)=>{


  try {


    const ticket =
      await store.callNextTicket();



    if(!ticket){

      return res.status(404).json({
        error:"No one is waiting in the queue."
      });

    }



    await broadcastState();


    io.emit("announce",{
      number: ticket.number,
      service: ticket.service?.name
    });



    res.json(ticket);



  }catch(err){

    res.status(400).json({
      error:err.message
    });

  }


});





// Serve specific ticket
app.post("/api/tickets/:number/serve",
async(req,res)=>{


try{


const ticket =
await store.serveTicket(
req.params.number
);



await broadcastState();


io.emit("announce",{
number:ticket.number
});



res.json(ticket);



}catch(err){

res.status(400).json({
error:err.message
});

}


});






// Recall ticket
app.post("/api/tickets/:number/recall",
async(req,res)=>{


try{


const ticket =
await store.recallTicket(
req.params.number
);



await broadcastState();



io.emit("announce",{
number:ticket.number
});



res.json(ticket);



}catch(err){

res.status(400).json({
error:err.message
});

}


});







// Complete ticket
app.post("/api/tickets/:number/complete",
async(req,res)=>{


try{


const ticket =
await store.completeTicket(
req.params.number
);



await broadcastState();


res.json(ticket);



}catch(err){

res.status(400).json({
error:err.message
});

}


});






// ================= SERVICES =================



app.post("/api/services",
async(req,res)=>{


try{


const service =
await store.addService(
req.body.name
);



await broadcastState();


res.status(201).json(service);



}catch(err){

res.status(400).json({
error:err.message
});

}


});





app.put("/api/services/:id",
async(req,res)=>{


try{


const service =
await store.updateService(
req.params.id,
req.body.name
);



await broadcastState();


res.json(service);



}catch(err){

res.status(400).json({
error:err.message
});

}


});






app.delete("/api/services/:id",
async(req,res)=>{


try{


await store.deleteService(
req.params.id
);



await broadcastState();


res.status(204).end();



}catch(err){

res.status(400).json({
error:err.message
});

}


});







// ================= CONFIG =================


app.put("/api/config",
async(req,res)=>{


try{


const config =
await store.updateConfig(
req.body
);



await broadcastState();



res.json(config);



}catch(err){

res.status(400).json({
error:err.message
});

}


});






// ================= FRONTEND =================


const clientDist =
path.join(__dirname,"..","client","dist");


app.use(
express.static(clientDist)
);



app.get("*",(req,res,next)=>{


if(req.path.startsWith("/api"))
return next();



res.sendFile(
path.join(clientDist,"index.html"),
(err)=>{

if(err)
next();

});

});






// ================= SOCKET.IO =================

io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  try {
    const state = await store.publicState();
    socket.emit("state", state);
  } catch (err) {
    console.error("Failed to send initial state:", err);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});