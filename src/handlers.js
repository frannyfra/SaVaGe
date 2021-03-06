const fs = require("fs");
const path = require("path");
const queries = require("./queries");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");

module.exports = {
  staticAssets(req, res, username) {
    const extension = path.extname(req.url).substring(1);
    const extensionType = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      ico: "image/x-icon"
    };
    const filePath = path.join(__dirname, "..", req.url);
    fs.readFile(filePath, "utf-8", (error, file) => {
      if (error) {
        res.writeHead(500, { "content-type": "text/html" });
        res.end(error.message);
      } else {
        res.writeHead(200, { "content-type": extensionType[extension] });
        res.end(file.replace("{{ username }}", username));
      }
    });
  },

  login(req, res) {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", () => {
      let {username, password} = querystring.parse(data);
      let formattedUsername = username.toUpperCase();
      queries.getUserQuery( formattedUsername, password, (err, userDetails) => {
          if(err) {
            res.writeHead(301, { location: "/" });
            res.end();
          } else {
            const jwtToken = jwt.sign(userDetails, process.env.SECRET);
            res.writeHead(301, {
              location: "/",
              "Set-Cookie": "token=" + jwtToken
            });
            res.end();
          }
        });
    });
  },

  logout(req, res) {
    res.writeHead(301, {
      location: "/",
      "Set-Cookie": "token=false; Max-Age=0"
    });
    res.end();
  },

  postSVG(req, res, id) {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", () => {
      let dataObject = JSON.parse(data);
      queries.postSVGquery(
        dataObject.name,
        dataObject.props,
        id,
        (error, result) => {
          res.writeHead(200, { "content-type": "text/html" });
          if (error) {
            res.end(JSON.stringify({error}));
          } else {
            res.end("{}");
          }
        }
      );
    });
  },
  getAllData(req, res) {
    queries.getAllDataQuery(result => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result.rows));
    });
  },

  getSVGs(req, res, userId) {
    queries.getSVGsQuery(userId, (result) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result.rows));
    });
  },

  postSHAPE(req, res) {
    let data2 = "";
    req.on("data", chunk => {
      data2 += chunk;
    });
    req.on("end", () => {
      let data2Obj = JSON.parse(data2);
      queries.postSHAPEquery(
        data2Obj.name,
        data2Obj.props,
        data2Obj.type,
        (error, result) => {
          res.writeHead(200, { "content-type": "text/html" });
          if (error) {
           res.end(JSON.stringify({error}));
          } else {
            res.end("{}");
          }
        }
      );
    });
  },

  getSHAPEs(req, res) {
    queries.getSHAPEsquery(result => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result.rows));
    });
  },

  insertSVG_SHAPE(req, res) {
    let data3 = "";
    req.on("data", chunk => {
      data3 += chunk;
    });
    req.on("end", () => {
      let obj = JSON.parse(data3);
      queries.insertSVG_SHAPEquery(
        obj.svg_id,
        obj.shape_id,
        (error, result) => {
          if (error) return error;
          res.writeHead(200, { "content-type": "text/html" });
          res.end("{}");
        }
      );
    });
  },

  notFound(req, res) {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("404: File not found");
  }
};
