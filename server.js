const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// MongoDB Models
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  userName: String,
  messages: [{
    sender: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  technologies: [String],
  githubLink: String,
  liveDemo: String
});

const SkillSchema = new mongoose.Schema({
  name: String,
  category: String,
  level: Number
});

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Message = mongoose.model('Message', MessageSchema);
const Chat = mongoose.model('Chat', ChatSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Skill = mongoose.model('Skill', SkillSchema);
const Admin = mongoose.model('Admin', AdminSchema);

// API Routes

// Messages
app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    if (admin.password !== password) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize default admin
const initAdmin = async () => {
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new Admin({ username: 'admin', password: 'admin123' });
    await admin.save();
    console.log('Default admin created: admin / admin123');
  }
};
initAdmin();

// Initialize default data
const initData = async () => {
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    const defaultProjects = [
      {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce solution with cart, checkout, and payment integration.',
        image: 'https://via.placeholder.com/400x250/1a1a2e/fff?text=E-Commerce',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        githubLink: '#',
        liveDemo: '#'
      },
      {
        title: 'Task Management App',
        description: 'Collaborative task management tool with real-time updates.',
        image: 'https://via.placeholder.com/400x250/16213e/fff?text=Task+App',
        technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
        githubLink: '#',
        liveDemo: '#'
      },
      {
        title: 'Portfolio Website',
        description: 'Personal portfolio with blog and contact functionality.',
        image: 'https://via.placeholder.com/400x250/0f3460/fff?text=Portfolio',
        technologies: ['Next.js', 'MongoDB', 'Socket.io'],
        githubLink: '#',
        liveDemo: '#'
      }
    ];
    await Project.insertMany(defaultProjects);
  }

  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    const defaultSkills = [
      { name: 'HTML/CSS', category: 'Frontend', level: 95 },
      { name: 'JavaScript', category: 'Frontend', level: 90 },
      { name: 'React', category: 'Frontend', level: 85 },
      { name: 'Node.js', category: 'Backend', level: 88 },
      { name: 'MongoDB', category: 'Database', level: 85 },
      { name: 'Git', category: 'Tools', level: 80 },
      { name: 'Docker', category: 'Tools', level: 75 }
    ];
    await Skill.insertMany(defaultSkills);
  }
};
initData();

// Socket.io for Real-time Chat
let connectedUsers = [];
let adminSocket = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChat', (userName) => {
    connectedUsers.push({ id: socket.id, name: userName });
    socket.broadcast.emit('userJoined', { name: userName });
    io.emit('updateUsers', connectedUsers);
  });

  socket.on('sendMessage', async (data) => {
    const { userName, message, isAdmin } = data;
    
    // Save to database
    let chat = await Chat.findOne({ userName: userName, isActive: true });
    if (!chat) {
      chat = new Chat({ userName, messages: [] });
    }
    chat.messages.push({
      sender: isAdmin ? 'Admin' : userName,
      text: message,
      timestamp: new Date()
    });
    await chat.save();

    if (isAdmin) {
      socket.to(socket.id).emit('receiveMessage', { 
        sender: 'Admin', 
        text: message 
      });
    } else {
      io.emit('receiveMessage', { 
        sender: userName, 
        text: message 
      });
    }
  });

  socket.on('adminConnect', () => {
    adminSocket = socket.id;
    socket.emit('adminConnected');
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
    io.emit('updateUsers', connectedUsers);
    if (adminSocket === socket.id) {
      adminSocket = null;
    }
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
