const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const createApp = require('../src/app');

let server;
let baseUrl;
let temporaryDirectory;

before(async () => {
  temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'student-api-'));
  const app = createApp({
    dataFile: path.join(temporaryDirectory, 'students.json'),
  });

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/students`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  if (temporaryDirectory) {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test('serves the student management dashboard', async () => {
  const response = await fetch(new URL('/', baseUrl));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(await response.text(), /Manage your student records in one place/);
});

test('creates, reads, updates, and deletes students with validation', async () => {
  const emptyList = await fetch(baseUrl);
  assert.equal(emptyList.status, 200);
  assert.deepEqual(await emptyList.json(), []);

  const invalidResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Avery' }),
  });
  assert.equal(invalidResponse.status, 400);
  assert.ok((await invalidResponse.json()).errors.length > 0);

  const studentData = {
    name: 'Avery Student',
    email: 'avery@example.com',
    age: 20,
    course: 'Computer Science',
  };
  const createResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });
  assert.equal(createResponse.status, 201);
  const createdStudent = await createResponse.json();
  assert.equal(createdStudent.name, studentData.name);
  assert.ok(createdStudent.id);

  const duplicateResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...studentData, email: 'AVERY@example.com' }),
  });
  assert.equal(duplicateResponse.status, 409);

  const getResponse = await fetch(`${baseUrl}/${createdStudent.id}`);
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), createdStudent);

  const updatedData = { ...studentData, course: 'Mathematics' };
  const updateResponse = await fetch(`${baseUrl}/${createdStudent.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).course, 'Mathematics');

  const deleteResponse = await fetch(`${baseUrl}/${createdStudent.id}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(`${baseUrl}/${createdStudent.id}`);
  assert.equal(missingResponse.status, 404);
});
