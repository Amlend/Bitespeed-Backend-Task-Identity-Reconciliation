import express from "express";
import bodyParser from "body-parser";
import sequelize from "./util/database";

const app = express();

app.use(bodyParser.json());

const handleContactsRoutes = require("./routes/handleContacts");
app.use(handleContactsRoutes);

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
