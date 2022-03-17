import express from 'express';
import { v4 } from 'uuid';

const app = express();
const port = 3000;

app.use(express.json());

let users = [
  {
    id: 'fd218ada-ee7e-4b89-a3c2-2b65c53ef794',
    name: 'Laudemir',
    cpf: '00000000000',
    notes: [
      {
        id: '122ad11a-74a8-4e55-ba72-05baae49d92e',
        title: 'Dica',
        content: 'Organizar meu dia',
        created_at: '2022-03-15T23:32:35.376Z',
      },
    ],
  },
  {
    id: 'fd218ada-ee7e-4b89-a3c2-2b65c53ef794',
    name: 'Luna',
    cpf: '00000000001',
    notes: [],
  },
];

const verifyCpfExistsParams = (req, res, next) => {
  const { cpf } = req.params;
  const user = users.find((element) => cpf === element.cpf);
  if (!user) {
    return res.status(404).json({ error: 'User is not registered' });
  }
  return next();
};

const verifyCpfExistsBody = (req, res, next) => {
  const { cpf } = req.body;
  const user = users.find((element) => cpf === element.cpf);
  if (user) {
    return res.status(422).json({ error: 'User already exists' });
  }
  return next();
};

const verifyNoteExists = (req, res, next) => {
  const { cpf, id } = req.params;
  const user = users.find((element) => element.cpf === cpf);
  const note = user.notes.find((element) => element.id === id);
  console.log(note);
  if (!note) {
    return res.status(404).json({ error: 'Note is not registered' });
  }
  return next();
};

app.post('/users', verifyCpfExistsBody, (req, res) => {
  const { name, cpf } = req.body;
  const newUser = { id: v4(), name, cpf, notes: [] };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get('/users', (_, res) => {
  res.status(200).json(users);
});

app.patch('/users/:cpf', verifyCpfExistsParams, (req, res) => {
  const cpfParams = req.params.cpf;
  const { name, cpf } = req.body;
  const user = users.find((element) => element.cpf === cpfParams);
  user.name = name;
  user.cpf = cpf;
  res.status(200).json({ message: 'User is updated', user });
});

app.delete('/users/:cpf', verifyCpfExistsParams, (req, res) => {
  const { cpf } = req.params;
  users = users.filter((element) => element.cpf !== cpf);
  res.status(204).json();
});

app.post('/users/:cpf/notes', verifyCpfExistsParams, (req, res) => {
  const { cpf } = req.params;
  const { title, content } = req.body;
  const user = users.find((element) => element.cpf === cpf);
  const note = { id: v4(), title, content, created_at: new Date() };
  user.notes.push(note);
  res.status(201).json({ message: `Tip was added into ${user.name} notes` });
});

app.get('/users/:cpf/notes', (req, res) => {
  const { cpf } = req.params;
  const user = users.find((element) => element.cpf === cpf);
  res.json(user.notes);
});

app.patch('/users/:cpf/notes/:id', verifyNoteExists, (req, res) => {
  const { cpf, id } = req.params;
  const { title, content } = req.body;
  const user = users.find((element) => element.cpf === cpf);
  const notes = user.notes.find((element) => element.id === id);
  notes.title = title;
  notes.content = content;
  notes.updated_at = new Date();
  res.status(200).json(notes);
});

app.delete('/users/:cpf/notes/:id', verifyNoteExists, (req, res) => {
  const { cpf, id } = req.params;
  const user = users.filter((element) => element.cpf === cpf);
  const notes = user.notes.filter((element) => element.id === id);
  user.notes = notes;
  res.status(204).json();
});

app.listen(port, () => console.log('Server is running on the port 3000'));
