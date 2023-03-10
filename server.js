const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');
const PORT = process.env.PORT || 3001;


const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


// Read content from db.json file and append new object
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// Read content from db.json and delete object with id
const readAndDelete = (id, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        for(i=0; i<parsedData.length; i++) {
            if (parsedData[i].note_id == id) {
                parsedData.splice(i,1);
            }
        }
        //parsedData.push(content);
        console.log(parsedData);
        writeToFile(file, parsedData);
      }
    });
  };




// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});


// POST Route for a new note
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      note_id : uuid(),
      title,
      text,
    };

    readAndAppend(newNote, './db/db.json');
    res.json(`Note added successfully ????`);
  } else {
    res.error('Error in adding note');
  }
});

// DELETE Route to remove a note
app.delete('/api/notes/:id', (req,res) => {
    console.info(`${req.method} request received to delete a note with id ${req.params.id}`);
    readAndDelete(req.params.id,'./db/db.json');
});


// Wilcard route
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname,'/public/index.html'));
  });
  

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} ????`)
);
