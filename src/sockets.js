import mysql from "mysql";

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sis_dist",
});
let ciudades = [];

conn.connect(function (err) {
  if (err) throw err;
  conn.query("SELECT * FROM ciudades", function (err, result, fields) {
    if (err) throw err;
    ciudades = result;
  });
});

export default (io) => {
  io.on("connection", (socket) => {
    console.log("nuevo socket connectado:", socket.id);

    socket.emit("listCities", ciudades);

    socket.on("newPerson", (persona) => {
      conn.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = `INSERT INTO personas (nombre, telefono, direccion, ciudad) VALUES ("${persona.nombre}", "${persona.telefono}", "${persona.direccion}", "${persona.ciudad}")`;
        conn.query(sql, function (err, result) {
          if (err) throw err;
          socket.emit("newRegisterPerson", "Persona registrada");
        });
      });
    });

    socket.on("searchPerson", (search) => {
      conn.query(
        `SELECT * FROM personas WHERE telefono = "${search.telefono}"`,
        function (err, result, fields) {
          if (err) throw err;
          if (result.length > 0)
            socket.emit("resSearchPerson", "Usuario encontrado");
          else socket.emit("resSearchPerson", "Usuario no encontrado");
        }
      );
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "disconnected");
    });
  });
};
