const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Sample data storage (in production, use a database)
let members = Array(30).fill(null).map((_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  image: null,
  email: '',
  bio: ''
}));

let logoImage = null;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Get all members
app.get('/api/members', (req, res) => {
  res.json(members);
});

// Get single member
app.get('/api/members/:id', (req, res) => {
  const member = members.find(m => m.id === parseInt(req.params.id));
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  res.json(member);
});

// Upload member image
app.post('/api/members/:id/upload', upload.single('image'), (req, res) => {
  const member = members.find(m => m.id === parseInt(req.params.id));
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  if (req.file) {
    member.image = `/uploads/${req.file.filename}`;
    member.name = req.body.name || member.name;
    member.email = req.body.email || member.email;
    member.bio = req.body.bio || member.bio;
  }
  
  res.json(member);
});

// Update member info
app.put('/api/members/:id', (req, res) => {
  const member = members.find(m => m.id === parseInt(req.params.id));
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  member.name = req.body.name || member.name;
  member.email = req.body.email || member.email;
  member.bio = req.body.bio || member.bio;
  
  res.json(member);
});

// Upload logo
app.post('/api/logo/upload', upload.single('logo'), (req, res) => {
  if (req.file) {
    logoImage = `/uploads/${req.file.filename}`;
    res.json({ logo: logoImage });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

// Get logo
app.get('/api/logo', (req, res) => {
  res.json({ logo: logoImage });
});

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React build
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
