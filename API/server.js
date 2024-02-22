const http           = require('http');
const app            = require('./app'); 
const globalVariable = require('./nodemonConfig.js');
const port           = globalVariable.port;
const project 		 = globalVariable.projectName;
const server         = http.createServer(app);
server.listen(port);

console.log("");
console.log("****************************************");
console.log("");
console.log(project+" - API is running on port --> ",port   );
console.log("");
console.log("****************************************");
console.log("");

