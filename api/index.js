const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults({ static: false }); // disables /public serving

server.use(middlewares);
server.use(router);

server.listen(10000, () => {
  console.log("JSON Server is running on port 10000");
});
