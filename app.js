const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const users = require("./json/users.json");
const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000"];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.header("Access-Control-Allow-Credentials", true);

  return next();
});

app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.post("/user", (req, res) => {
  const searchQuery = req.query.search;
  const data = users.filter((element) => {
    delete element["password"];
    return element?.oracleID?.toString()?.includes(searchQuery);
  });
  res.status(200).json(data);
});

app.get("/interviewDetail/:id", (req, res) => {
  const interviewListJson = JSON.parse(
    fs.readFileSync("./json/interviewList.json")
  );

  const id = req.params.id;
  const data = interviewListJson.find((element) => element.id === id);
  res.status(200).json(data);
});

app.post("/createInterview", (req, res) => {
  const data = req.body;
  data["id"] = uuidv4();
  const interviewListJson = JSON.parse(
    fs.readFileSync("./json/interviewList.json")
  );

  const newInterviewList = [{ ...data }, ...interviewListJson];

  fs.writeFile(
    "./json/interviewList.json",
    JSON.stringify(newInterviewList),
    (err) => {
      if (err) throw err;
      res.json({
        success: true,
        message: "Interview Created Successfully",
      });
    }
  );
});

app.get("/interviews", (req, res) => {
  const interviewListJson = JSON.parse(
    fs.readFileSync("./json/interviewList.json")
  );

  const finalData = interviewListJson.map((item, index) => ({
    ...item,

    cand_fullname:
      `${item.candidate_firstname} ${item.candidate_lastname}` || "",

    full_name: `${item.first_name} ${item.last_name}` || "",

    uid: index + 1,
  }));

  res.status(200).json(finalData);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const usersList = JSON.parse(fs.readFileSync("./json/users.json"));

  const foundUser = usersList.find((user) => user.email == email);

  if (foundUser) {
    let storedPass = foundUser.password;

    if (password.toString() === storedPass.toString()) {
      delete foundUser["password"];

      res.status(200).json({
        ...foundUser,
      });
    } else {
      res.status(400).json({ message: "Incorrect Password" });
    }
  } else {
    res.status(400).json({ message: "User not found" });
  }
});

app.listen(5000, () => {});
