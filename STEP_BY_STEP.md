# Student Management CRUD App: Step-by-Step

This guide explains how to install, run, and use the app on Windows. The app includes a browser dashboard and a Node.js API. Student records are saved in `data/students.json`.

## 1. Install Node.js

Install Node.js 18 or newer from [nodejs.org](https://nodejs.org/). Open PowerShell and check that Node.js and npm are available:

```powershell
node --version
npm --version
```

## 2. Open the project folder

In PowerShell, change to the project folder:

```powershell
cd "C:\Users\Sangram\Documents\myproject\Student-Management-API"
```

## 3. Install project dependencies

Run this once, and again if the project dependencies change:

```powershell
npm install
```

## 4. Start the app

Start the server:

```powershell
npm start
```

Keep this terminal open while using the app. By default, the server uses port `3000`.

If PowerShell reports that the port is already in use, start the app on another port:

```powershell
$env:PORT = "3001"
npm start
```

## 5. Open the dashboard

Open the address for the port you started:

- Default port: [http://localhost:3000](http://localhost:3000)
- Port `3001`: [http://localhost:3001](http://localhost:3001)

The dashboard shows the student list and summary. Use the form to add a student. Use the pencil button to edit a record, or the × button to delete it.

Each student needs:

- **Full name:** non-empty text
- **Email address:** valid and unique
- **Age:** a whole number from 1 to 120
- **Course:** non-empty text

The data is saved in `data/students.json` and remains available after restarting the server.

## 6. Use the API directly (optional)

The API base address is `http://localhost:3000/api/students`. If you selected another port, replace `3000` with that port.

### List all students

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/students"
```

### Add a student

```powershell
$student = @{
  name = "Alex Morgan"
  email = "alex@example.com"
  age = 20
  course = "Computer Science"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/students" `
  -Method Post `
  -ContentType "application/json" `
  -Body $student
```

The response includes the new student's `id`. Use that ID in the following examples.

### Get one student

```powershell
$id = "PASTE-STUDENT-ID-HERE"
Invoke-RestMethod -Uri "http://localhost:3000/api/students/$id"
```

### Update a student

`PUT` replaces the student's fields, so provide all four fields:

```powershell
$updatedStudent = @{
  name = "Alex Morgan"
  email = "alex@example.com"
  age = 21
  course = "Mathematics"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/students/$id" `
  -Method Put `
  -ContentType "application/json" `
  -Body $updatedStudent
```

### Delete a student

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/students/$id" -Method Delete
```

## 7. Run the tests

Open another PowerShell terminal in the project folder and run:

```powershell
npm test
```

## Project files

- `src/server.js` starts the web server.
- `src/app.js` defines the API routes and serves the dashboard.
- `src/studentStore.js` reads and writes student records.
- `public/index.html` contains the browser dashboard.
- `data/students.json` stores student records.
- `test/students.test.js` tests the dashboard and CRUD API.
