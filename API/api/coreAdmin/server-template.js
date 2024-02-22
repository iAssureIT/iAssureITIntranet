const http 				= require('http');
const app 				= require('./app'); // app file include
const globalVariable	= require('./nodemonConfig.js');
// const axios             = require('axios');
const port = globalVariable.port;
console.log(port)

const server = http.createServer(app);

// ============= Socket Programming ===============
// const io = require('socket.io')(server)
// const getApiAndEmit = async socket => {
//     try {
//       const res = await axios.get(
//         "http://localhost:3066/api/categorymaster/get/list"
//       ); // Getting the data from DarkSky
//       console.log('res', res.data)
//       socket.emit("FromAPI", res.data); // Emitting a new message. It will be consumed by the client
//     } catch (error) {
//       console.error(`Error: ${error.code}`);
//     }
//   };
// io.on("connection", socket => {
//   getApiAndEmit(socket);
//   socket.on("disconnect", () => console.log("Client disconnected"));
// });


server.listen(port);