# Personal Portfolio Website

A modern, responsive personal portfolio website with HTML/CSS frontend and Node.js/MongoDB backend.

## Features

- **Responsive Design** - Mobile-first approach with modern UI
- **Dark/Light Mode** - Clean modern visual design
- **Sections** - Home, About, Skills, Projects, Services, Contact
- **Real-time Chat** - Socket.io powered live chat system
- **Admin Dashboard** - Manage projects, skills, and view messages
- **MongoDB Integration** - Store messages, projects, and skills

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: Simple admin login

## Prerequisites

1. **Node.js** - Install from [nodejs.org](https://nodejs.org/)
2. **MongoDB** - Install locally or use MongoDB Atlas

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB

Edit the `.env` file and update your MongoDB connection string:

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/portfolio

# Or MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio
```

### 3. Start MongoDB

If using local MongoDB, make sure MongoDB is running:

```bash
# On Windows (as service)
net start MongoDB

# Or start manually
mongod
```

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Access

- **Portfolio Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## Project Structure

```
portfolio/
├── public/
│   ├── index.html      # Main portfolio page
│   ├── admin.html      # Admin dashboard
│   ├── styles.css      # Main styles
│   ├── admin.css      # Admin styles
│   ├── script.js      # Frontend JavaScript
│   └── admin.js       # Admin JavaScript
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables
└── README.md         # This file
```

## API Endpoints

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send a message

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Add a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Add a skill
- `DELETE /api/skills/:id` - Delete a skill

### Admin
- `POST /api/admin/login` - Admin login

## Customization

### Update Personal Info

Edit `public/index.html`:
- Change name in Hero section
- Update bio and description
- Modify contact information

### Update Projects

Use the Admin Dashboard or manually add to MongoDB.

### Change Styling

Edit `public/styles.css` to change colors, fonts, or layout.

## License

MIT License - Feel free to use for your own portfolio!
