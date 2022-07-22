const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>Write a Msg</title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='msg'><button type='submit'>Send</button></form></body>"
    );
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    req.on("end", () => {
      const buffer = Buffer.concat(body);
      const bufferString = buffer.toString();
      const parsedBody = bufferString.split("=")[1];
      fs.writeFile("message.txt", parsedBody, (err) => {});
    });
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>My First Node JS page</title></head>");
  res.write("<body><h1>Hello from my NODE.JS SERVER</h1></body>");
  res.write("</html>");
  res.end();
};

// module.exports = requestHandler;

exports.handler = requestHandler;
