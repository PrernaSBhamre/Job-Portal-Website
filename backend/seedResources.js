const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resource = require('./models/Resource');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = [
  {
    title: "Top 100 Interview Questions (PDF)",
    category: "Interview",
    readTime: "15 min read",
    content: "The ultimate list of the top 100 most frequently asked technical, behavioral, and HR questions at FAANG companies. This comprehensive guide helps freshers construct STAR-method answers.",
    author: "FresherHub Team"
  },
  {
    title: "ATS-Friendly Resume Templates",
    category: "Resume",
    readTime: "5 min read",
    content: "Download highly optimized, cleanly formatted resume templates that are guaranteed to pass Applicant Tracking Systems (ATS). Features sections specifically arranged to highlight academic projects and coding platforms.",
    author: "Career Coach Sarah"
  },
  {
    title: "TCS NQT Previous Papers Solved",
    category: "Placement",
    readTime: "25 min read",
    content: "A detailed breakdown of aptitude and coding questions from the 2024 TCS National Qualifier Test. We cover optimal solutions for numeric logic, reasoning, and programming challenges.",
    author: "Prep Experts"
  },
  {
    title: "Full Stack React & Node Masterclass Outline",
    category: "Courses",
    readTime: "10 min read",
    content: "Zero to hero roadmap for building 5 real-world MERN projects. Explore our curated syllabus covering MongoDB, Express.js, React Hooks, and Node.js REST APIs from scratch.",
    author: "John Doe"
  },
  {
    title: "Data Structures Crash Course Notes",
    category: "Courses",
    readTime: "30 min read",
    content: "Quick revision guide for coding interviews. Master Big O Notation, Linked Lists, Binary Trees, and Dynamic Programming with visual representations and Javascript code snippets.",
    author: "Algo Master"
  }
];

const importData = async () => {
    try {
        await connectDB();
        await Resource.deleteMany();
        await Resource.insertMany(seedData);
        console.log('Resources Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error('Failed to seed:', err);
        process.exit(1);
    }
}

importData();
