import express from "express";
require("dotenv").config();
import bodyParser from "body-parser";
import sequelize from "./util/database";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const handleContactsRoutes = require("./routes/handleContacts");
app.use(handleContactsRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is Running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
