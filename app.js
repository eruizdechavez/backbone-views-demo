var express = require('express'),
  http = require('http'),
  sio = require('socket.io'),
  path = require('path'),
  util = require('util');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

var patrocinadores = [];
var Patrocinador = function Patrocinador(data) {
    this.id = data.id || 0;
    this.nombre = data.nombre || "";
    this.url = data.url || "";
    this.banner = data.banner || "";

    return this;
  };

app.get('/api/patrocinadores/:id?', function(req, res) {
  if (!req.params.id) {
    return res.send(patrocinadores);
  } else if (patrocinadores[req.params.id - 1]) {
    return res.send(patrocinadores[req.params.id - 1]);
  } else {
    return res.send(404);
  }
});

app.post('/api/patrocinadores', function(req, res) {
  var p = new Patrocinador(req.body);
  p.id = patrocinadores.length + 1;
  patrocinadores.push(p);

  res.send(p);

  io.sockets.emit('message', {
    message: 'Nuevo Patrocinador agregado!',
    data: p,
    selfdestroy: 10 * 1000
  });

  return;
});

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

var io = sio.listen(server);
io.sockets.on('connection', function(socket) {
  socket.on('message', function() {
    console.log(util.inspect(arguments));
  });
});
