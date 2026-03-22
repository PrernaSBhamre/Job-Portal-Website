const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal');
        console.log('MongoDB Connected for Rich Data Synthesis...');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const defaultPerks = [
    "Comprehensive health insurance for you and your family",
    "Generous performance bonuses and stock options (ESOPs)",
    "Remote-first flexible working environment with $1,000 WFH stipend",
    "Unlimited Paid Time Off (PTO) to ensure work-life balance",
    "Free catered campus meals, gym memberships, and wellness programs"
];

const generateResponsibilities = (title) => {
    if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('react') || title.toLowerCase().includes('ui')) {
        return [
            "Build responsive, pixel-perfect, accessible UI components from Figma mockups",
            "Collaborate deeply with UI/UX designers and Product Managers",
            "Write clean, well-documented, testable code for the front-end architecture",
            "Participate actively in Agile ceremonies including sprint planning and retrospectives",
            "Optimize application performance and ensure cross-browser compatibility"
        ];
    } else if (title.toLowerCase().includes('backend') || title.toLowerCase().includes('node') || title.toLowerCase().includes('python')) {
        return [
            "Architect and deploy scalable, robust API microservices handling massive traffic",
            "Design, optimize, and index relational and NoSQL database schemas",
            "Implement high-performance caching layers using Redis or Memcached",
            "Ensure enterprise-grade security, data protection, and JWT authentication",
            "Automate comprehensive unit and integration tests for CI/CD pipelines"
        ];
    } else if (title.toLowerCase().includes('data') || title.toLowerCase().includes('ai') || title.toLowerCase().includes('machine')) {
        return [
            "Analyze complex, multi-terabyte datasets to extract actionable business intelligence",
            "Develop, train, and deploy predictive Machine Learning and AI models to production",
            "Build automated, scheduled Python data pipelines and ETL workflows",
            "Design interactive executive dashboards using Tableau or PowerBI",
            "Collaborate with engineers to integrate AI models into scalable backend services"
        ];
    } else {
        return [
            `Take end-to-end ownership of core responsibilities as a ${title}`,
            "Collaborate across cross-functional global teams in distributed environments",
            "Actively contribute to technical architecture discussions and system design",
            "Mentor junior team members and participate in regular code reviews",
            "Write highly optimized, scalable, and maintainable production code"
        ];
    }
};

const updateJobs = async () => {
    await connectDB();
    
    const jobs = await Job.find({});
    let updatedCount = 0;

    for (let job of jobs) {
        let changed = false;

        if (!job.responsibilities || job.responsibilities.length === 0) {
            job.responsibilities = generateResponsibilities(job.title);
            changed = true;
        }

        if (!job.eligibility || job.eligibility.trim() === "") {
            job.eligibility = `B.Tech/B.E. in Computer Science, IT, or related fields. Minimum ${job.experienceLevel || "2 years"} of professional experience required.`;
            changed = true;
        }

        if (!job.perks || job.perks.length === 0) {
            job.perks = defaultPerks;
            changed = true;
        }

        if (changed) {
            await job.save();
            updatedCount++;
        }
    }

    console.log(`Successfully expanded rich Unstop descriptions for ${updatedCount} jobs!`);
    process.exit(0);
};

updateJobs();
