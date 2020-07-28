const express = require('express');
const mongoose = require('mongoose');

const routes = require('./routes');

const app = express();

app.use(`${process.env.API_PATH}/auth`, routes.auth);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(process.env.PORT, async () => {
      console.log(`Server has been started on port ${process.env.PORT}...`);
    });
  } catch (e) {
    console.error('Server Error', e.message);
    process.exit(1);
  }
}

start();
