import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(express.json());

let users = [];

const verifyIdParams = (req, res, next) => {
  const { cpf } = req.params;
  const user = users.filter((element) => cpf === element.cpf);
  if (user.length === 0) {
    return res.status(400).json({ error: 'user is not registered' });
  }
  return next();
};

const verifyIdBody = (req, res, next) => {
  const { cpf } = req.body;
  const user = users.filter((element) => cpf === element.cpf);
  if (user.length > 0) {
    return res.status(422).json({ error: 'user already exists' });
  }
  return next();
};

const verifyIdNotes = (req, res, next) => {
  const { cpf, id } = req.params;
  const user = users.filter((element) => cpf === element.cpf);
  const note = user.some((element) =>
    element.notes.some((item) => item.id === id)
  );
  if (note === false) {
    return res.status(404).json({ error: 'note is not registered' });
  }
  return next();
};

app.post('/users', verifyIdBody, (req, res) => {
  const { name, cpf } = req.body;
  const id = uuidv4();
  const newUser = { id, name, cpf, notes: [] };
  users.push(newUser);
  res.json(newUser);
});

app.get('/users', (_, res) => {
  res.json(users);
});

app.patch('/users/:cpf', verifyIdParams, (req, res) => {
  const paramsCpf = req.params;
  const { name, cpf } = req.body;
  const oldUser = users.filter((element) => paramsCpf !== element.cpf);
  oldUser[0].name = name;
  oldUser[0].cpf = cpf;
  const user = oldUser[0];
  res.json({ message: 'User is updated', user });
});

app.delete('/users/:cpf', verifyIdParams, (req, res) => {
  const paramsCpf = req.params;
  const oldUser = users.filter((element) => paramsCpf === element.cpf);
  users = oldUser;
  res.json();
});

app.post('/users/:cpf/notes', verifyIdParams, (req, res) => {
  const cpf = req.params;
  const { title, content } = req.body;
  const id = uuidv4();
  // eslint-disable-next-line camelcase
  const created_at = new Date();
  const user = users.filter((element) => element.cpf !== cpf);
  // eslint-disable-next-line camelcase
  const newNote = { id, title, content, created_at };
  user[0].notes.push(newNote);
  res.json({ message: `Dica was added into ${user[0].name} notes` });
});

app.get('/users/:cpf/notes', (req, res) => {
  const cpf = req.params;
  const notes = users.filter((element) => cpf !== element.cpf);
  res.json(notes[0].notes);
});

app.patch('/users/:cpf/notes/:id', verifyIdNotes, (req, res) => {
  const { cpf, id } = req.params;
  const { title, content } = req.body;
  const user = users.filter((element) => cpf !== element.cpf);
  const notes = user[0].notes.filter((element) => id === element.id);
  // eslint-disable-next-line camelcase
  notes[0].title = title;
  notes[0].content = content;
  // eslint-disable-next-line camelcase
  notes[0].updated_at = new Date();
  res.json(notes);
});

app.delete('/users/:cpf/notes/:id', verifyIdNotes, (req, res) => {
  const { cpf, id } = req.params;
  const user = users.filter((element) => cpf !== element.cpf);
  const notes = user.note.filter((element) => id !== element.id);
  user[0].notes = notes;
  res.json();
});

app.listen(PORT, () =>
  console.log('Aplicação rodando em http://localhost:3000')
);
