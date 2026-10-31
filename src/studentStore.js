const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

class StudentStore {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]\n', 'utf8');
    }

    this.readStudents();
  }

  list() {
    return this.readStudents();
  }

  findById(id) {
    return this.readStudents().find((student) => student.id === id);
  }

  create(student) {
    const students = this.readStudents();
    const createdStudent = { id: randomUUID(), ...student };
    students.push(createdStudent);
    this.writeStudents(students);
    return createdStudent;
  }

  update(id, student) {
    const students = this.readStudents();
    const index = students.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return undefined;
    }

    students[index] = { id, ...student };
    this.writeStudents(students);
    return students[index];
  }

  delete(id) {
    const students = this.readStudents();
    const index = students.findIndex((student) => student.id === id);

    if (index === -1) {
      return false;
    }

    students.splice(index, 1);
    this.writeStudents(students);
    return true;
  }

  readStudents() {
    const students = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));

    if (!Array.isArray(students)) {
      throw new Error('Student data must be a JSON array.');
    }

    return students;
  }

  writeStudents(students) {
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(students, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, this.filePath);
  }
}

module.exports = StudentStore;
