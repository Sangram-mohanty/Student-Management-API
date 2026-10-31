# Student Management API

A Node.js REST API with a browser-based CRUD dashboard for creating, viewing, updating, and deleting student records. Student data is stored in `data/students.json` and persists across server restarts.

## Requirements

- Node.js 18 or newer

## Run

```sh
npm install
npm start
```

The API listens on port `3000` by default. Set `PORT` to use a different port, or set `STUDENTS_FILE` to change the JSON data file.

Open [http://localhost:3000](http://localhost:3000) to use the student management dashboard.

## Student fields

Every student has:

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Must not be empty |
| `email` | string | Must be a valid, unique email address |
| `age` | integer | Must be between 1 and 120 |
| `course` | string | Must not be empty |

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/students` | List all students |
| `GET` | `/api/students/:id` | Get a student by ID |
| `POST` | `/api/students` | Create a student |
| `PUT` | `/api/students/:id` | Replace a student's fields |
| `DELETE` | `/api/students/:id` | Delete a student |

Send `POST` and `PUT` requests with a JSON body containing all four student fields. Successful creation returns `201`; validation errors return `400`; duplicate emails return `409`; missing students return `404`.

Run the API tests with:

```sh
npm test
```
