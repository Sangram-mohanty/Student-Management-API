const path = require('node:path');
const express = require('express');
const StudentStore = require('./studentStore');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_FIELDS = ['name', 'email', 'age', 'course'];

function validateStudent(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object.'];
  }

  for (const field of STUDENT_FIELDS) {
    if (!Object.hasOwn(body, field)) {
      errors.push(`${field} is required.`);
    }
  }

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name must be a non-empty string.');
  }

  if (typeof body.email !== 'string' || !EMAIL_PATTERN.test(body.email.trim())) {
    errors.push('email must be a valid email address.');
  }

  if (!Number.isInteger(body.age) || body.age < 1 || body.age > 120) {
    errors.push('age must be an integer between 1 and 120.');
  }

  if (typeof body.course !== 'string' || body.course.trim().length === 0) {
    errors.push('course must be a non-empty string.');
  }

  return errors;
}

function createApp(options = {}) {
  const dataFile = options.dataFile
    || process.env.STUDENTS_FILE
    || path.join(__dirname, '..', 'data', 'students.json');
  const store = options.store || new StudentStore(dataFile);
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/students', (req, res) => {
    res.json(store.list());
  });

  app.get('/api/students/:id', (req, res) => {
    const student = store.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.json(student);
  });

  app.post('/api/students', (req, res) => {
    const errors = validateStudent(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const duplicateEmail = store.list().some(
      (student) => student.email.toLowerCase() === req.body.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      return res.status(409).json({ error: 'A student with this email already exists.' });
    }

    const student = store.create({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      age: req.body.age,
      course: req.body.course.trim(),
    });

    return res
      .location(`/api/students/${student.id}`)
      .status(201)
      .json(student);
  });

  app.put('/api/students/:id', (req, res) => {
    const existingStudent = store.findById(req.params.id);

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const errors = validateStudent(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const duplicateEmail = store.list().some(
      (student) => student.id !== req.params.id
        && student.email.toLowerCase() === req.body.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      return res.status(409).json({ error: 'A student with this email already exists.' });
    }

    const student = store.update(req.params.id, {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      age: req.body.age,
      course: req.body.course.trim(),
    });

    return res.json(student);
  });

  app.delete('/api/students/:id', (req, res) => {
    if (!store.delete(req.params.id)) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.status(204).end();
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Request body contains invalid JSON.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

module.exports = createApp;
