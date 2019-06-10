const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { imageHash } = require('image-hash');

const app = express();

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname) + '-' + Date.now() + path.extname(file.originalname));
  } 
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 9000000,
    files: 1
  }
});

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('image-upload'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('No File Uploaded');
    error.httpStatusCode = 400;
    return next(error);
  }

  const precise = !!req.body.precise;
  const bits = Number(req.body.bitAmount);

  imageHash(req.file.path, bits, precise, (error, hash) => {
    if (error) {
      return res.status(400).send('Error!');
    }

    res.set('Content-Type', 'text/html');

    res.send(`<html><head><title>EZ Block-Hash</title></head><body>Hash: ${hash}</body></html>`);
  });
});

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));