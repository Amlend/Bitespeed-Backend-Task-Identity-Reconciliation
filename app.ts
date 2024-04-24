import express from "express";
import bodyParser from "body-parser";
import sequelize from "./util/database";
import { handleContacts } from "./controllers/identify";

const app = express();

app.use(bodyParser.json());

app.post("/identify", handleContacts);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Server is Running on port 3000`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
