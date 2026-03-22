const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for 30 Jobs Seeder'))
  .catch(err => { console.error('DB Connect Error:', err.message || err.toString()); process.exit(1); });

const seedJobs = async () => {
  try {
    // Need a recruiter user to own these jobs
    let user = await User.findOne({ role: 'recruiter' });
    if (!user) {
        user = await User.create({
            fullname: 'Global HR Manager',
            email: 'hr.manager@global.com',
            phoneNumber: 9999999999,
            password: 'password123',
            role: 'recruiter'
        });
    }

    const companyData = [
      { name: 'TCS', location: 'Mumbai, India', description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.' },
      { name: 'Infosys', location: 'Bangalore, India', description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.' },
      { name: 'Wipro', location: 'Pune, India', description: 'Wipro Limited is a leading technology services and consulting company focused on building innovative solutions.' },
      { name: 'Google', location: 'Hyderabad, India', description: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.' },
      { name: 'Microsoft', location: 'Bangalore, India', description: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.' },
      { name: 'Amazon', location: 'Chennai, India', description: 'Amazon is a global technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.' },
      { name: 'Flipkart', location: 'Bangalore, India', description: 'Flipkart is an Indian e-commerce company, headquartered in Bangalore, Karnataka, India, and incorporated in Singapore as a private limited company.' },
      { name: 'Zomato', location: 'Gurgaon, India', description: 'Zomato is an Indian multinational restaurant aggregator and food delivery company founded in 2008.' },
      { name: 'Postman', location: 'Bangalore, India', description: 'Postman is an API platform for building and using APIs. Postman simplifies each step of the API lifecycle and streamlines collaboration.' },
      { name: 'OpenAI', location: 'Remote', description: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.' }
    ];

    const companies = [];
    for (const c of companyData) {
        let comp = await Company.findOne({ name: c.name });
        if (!comp) {
            comp = await Company.create({ ...c, userId: user._id });
        }
        companies.push(comp);
    }

    const getComp = (name) => companies.find(c => c.name === name)._id;

    const jobs = [
      {
        title: "Senior React Developer",
        description: "We are seeking a highly skilled Senior React Developer to join our core engineering team. You will be responsible for architecting and building the next generation of our flagship SaaS product, focusing on seamless user experiences and high performance. The ideal candidate will have deep expertise in React.js, state management libraries (Redux/Context API), and a strong understanding of modern web standards. You will collaborate closely with product managers, UX designers, and backend engineers to define and implement complex frontend features.",
        responsibilities: [
          "Architect and build advanced web applications using React.js and Redux",
          "Translate UI/UX wireframes into high-quality, reusable components",
          "Optimize components for maximum performance across a vast array of web-capable devices",
          "Collaborate with backend developers to integrate RESTful APIs",
          "Mentor junior developers and conduct extensive code reviews"
        ],
        eligibility: "B.Tech/B.E. in Computer Science, IT, or related fields. Minimum 5 years of professional frontend experience.",
        perks: [
          "Comprehensive health insurance for you and dependents",
          "Generous stock options and performance bonuses",
          "Flexible remote work policies and $1,000 home office stipend",
          "Unlimited Paid Time Off (PTO)",
          "Free catered campus meals and gym memberships"
        ],
        requirements: ["5+ years of software development experience", "Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model", "Experience with React.js workflows (Flux or Redux)", "Familiarity with newer specifications of ECMAScript"],
        salary: "₹18L - ₹25L",
        experienceLevel: "5+ Years",
        location: "Bangalore, India",
        jobType: "Full-Time",
        position: 2,
        tags: ["React", "JavaScript", "Frontend"],
        company: getComp("Google"),
        created_by: user._id
      },
      {
        title: "Node.js Backend Engineer",
        description: "Join our fast-paced backend team to build highly scalable microservices that power millions of transactions daily. You will design, develop, and maintain robust APIs using Node.js and Express, ensuring maximum performance and reliability. The role involves deep integration with NoSQL databases like MongoDB and Redis for caching. You will also write automated tests, optimize query performance, and participate in architecture reviews to continuously improve our backend infrastructure.",
        requirements: ["3+ years of Node.js experience", "Strong understanding of asynchronous programming", "Experience with MongoDB and RESTful APIs", "Familiarity with AWS or GCP deployment environments"],
        salary: "₹12L - ₹18L",
        experienceLevel: "3-5 Years",
        location: "Pune, India",
        jobType: "Full-Time",
        position: 3,
        tags: ["Node.js", "Express", "MongoDB", "Backend"],
        company: getComp("Microsoft"),
        created_by: user._id
      },
      {
        title: "Data Scientist (AI/ML)",
        description: "We are looking for a brilliant Data Scientist to leverage machine learning and artificial intelligence to extract actionable insights from our massive datasets. You will be responsible for developing predictive models, analyzing user behavior patterns, and deploying algorithms into production systems. Collaboration with data engineers to build robust data pipelines is highly essential. The successful candidate will have a strong foundation in statistical modeling and hands-on experience with Python-based ML frameworks like TensorFlow or PyTorch.",
        requirements: ["Master's degree in CS, IT, or related field", "Solid understanding of machine learning algorithms", "Hands-on experience with Python, Pandas, and Scikit-learn", "Experience deploying models to cloud infrastructure"],
        salary: "₹15L - ₹22L",
        experienceLevel: "2-4 Years",
        location: "Hyderabad, India",
        jobType: "Full-Time",
        position: 1,
        tags: ["Machine Learning", "Python", "Data Science", "AI"],
        company: getComp("Amazon"),
        created_by: user._id
      },
      {
        title: "Full Stack Developer (MERN)",
        description: "An exciting opportunity for a Full Stack Developer to take ownership of entire product features from frontend to backend. You will build dynamic, responsive user interfaces using React while simultaneously architecting scalable backend endpoints with Node.js and MongoDB. This role requires a problem-solving mindset, the ability to work independently, and a passion for writing clean, maintainable code. You will also be actively involved in code reviews, mentoring junior developers, and setting engineering best practices.",
        requirements: ["Proficiency in MongoDB, Express, React, and Node.js", "Experience with REST API design and implementation", "Familiarity with Git version control", "Understanding of fundamental design principles behind a scalable application"],
        salary: "₹8L - ₹14L",
        experienceLevel: "1-3 Years",
        location: "Mumbai, India",
        jobType: "Full-Time",
        position: 4,
        tags: ["MERN", "React", "Node.js", "Full Stack"],
        company: getComp("TCS"),
        created_by: user._id
      },
      {
        title: "AI Research Engineer",
        description: "Drive the frontier of artificial intelligence research and development within an innovative global team. You will be exploring and prototyping state-of-the-art Natural Language Processing (NLP) models, large language models (LLMs), and computer vision technologies. The role involves reading research papers, implementing novel architectures, and finding practical ways to integrate new AI breakthroughs into commercial products. A strong mathematical background and deep experience with GPU-accelerated computing is critical.",
        requirements: ["Ph.D. or Master's in Artificial Intelligence or related field", "Published research in top-tier conferences (NeurIPS, ICML, ACL)", "Expertise in PyTorch and CUDA programming", "Strong problem-solving and analytical skills"],
        salary: "$120k - $180k",
        experienceLevel: "2+ Years",
        location: "Remote",
        jobType: "Full-Time",
        position: 2,
        tags: ["AI", "Research", "NLP", "PyTorch"],
        company: getComp("OpenAI"),
        created_by: user._id
      },
      {
        title: "UI/UX Designer",
        description: "We are searching for a creative UI/UX Designer who can transform complex user requirements into intuitive, accessible, and beautiful digital experiences. You will conduct user research, create wireframes and high-fidelity prototypes, and conduct usability testing. Working alongside product managers and developers, you will ensure designs are technically feasible while refusing to compromise on user experience. A strong portfolio demonstrating your design process and problem-solving skills is an absolute requirement.",
        requirements: ["Proven UI/UX design experience with a strong portfolio", "Solid experience in creating wireframes, storyboards, user flows, and site maps", "Proficiency in Figma, Sketch, or Adobe XD", "Excellent visual design skills with sensitivity to user-system interaction"],
        salary: "₹6L - ₹10L",
        experienceLevel: "1-3 Years",
        location: "Bangalore, India",
        jobType: "Full-Time",
        position: 2,
        tags: ["UI", "UX", "Design", "Figma"],
        company: getComp("Flipkart"),
        created_by: user._id
      },
      {
        title: "Cloud Infrastructure Engineer",
        description: "Join us in managing and scaling a highly complex, globally distributed cloud infrastructure environment. You will automate provisioning, configuration, and deployment processes using Infrastructure as Code (IaC) tools like Terraform and Ansible. The role involves monitoring system performance, troubleshooting complex networking issues, and ensuring our Kubernetes clusters are robust and secure. Strong experience with AWS or Core GCP services and a passion for automation are key attributes we are seeking.",
        requirements: ["Strong experience with AWS (EC2, S3, RDS, VPC)", "Experience with Docker and Kubernetes", "Proficiency in scripting languages (Bash, Python)", "Knowledge of CI/CD pipelines (Jenkins, GitHub Actions)"],
        salary: "₹14L - ₹20L",
        experienceLevel: "3-5 Years",
        location: "Chennai, India",
        jobType: "Full-Time",
        position: 3,
        tags: ["Cloud", "AWS", "Kubernetes", "DevOps"],
        company: getComp("Infosys"),
        created_by: user._id
      },
      {
        title: "Junior Frontend Engineer",
        description: "A perfect launchpad for a passionate new developer looking to gain significant experience in frontend web development. You will be writing clean, efficient HTML, CSS, and JavaScript, contributing to our main customer-facing web application. Under the mentorship of senior engineers, you will learn modern frameworks like Vue.js or React, implement responsive designs, and fix UI bugs. We value enthusiasm, a strong willingness to learn, and a solid foundation in core web technologies.",
        requirements: ["Basic understanding of web markup, including HTML5, CSS3", "Basic understanding of client-side scripting and JavaScript frameworks", "Familiarity with browser testing and debugging", "Good understanding of SEO principles"],
        salary: "₹4L - ₹6L",
        experienceLevel: "0-1 Years",
        location: "Gurgaon, India",
        jobType: "Full-Time",
        position: 5,
        tags: ["Frontend", "HTML", "CSS", "JavaScript"],
        company: getComp("Zomato"),
        created_by: user._id
      },
      {
        title: "Backend API Developer",
        description: "We need a focused Backend Developer specialized in building secure, high-performance RESTful APIs to serve millions of requests. You will design database schemas, implement authentication flows (OAuth, JWT), and focus heavily on reducing API latency. The role requires meticulous attention to detail regarding API versioning, documentation (Swagger), and error handling. You will collaborate closely with frontend and mobile teams who consume the APIs you build.",
        requirements: ["Experience developing RESTful APIs", "Strong knowledge of Node.js and TypeScript", "Experience with SQL and NoSQL databases", "Understanding of API security best practices"],
        salary: "₹10L - ₹15L",
        experienceLevel: "2-4 Years",
        location: "Bangalore, India",
        jobType: "Full-Time",
        position: 4,
        tags: ["API", "Backend", "Node.js", "TypeScript"],
        company: getComp("Postman"),
        created_by: user._id
      },
      {
        title: "Machine Learning Engineer",
        description: "As an ML Engineer, you will bridge the gap between data science and software engineering by putting predictive models into scalable production. You will build and optimize machine learning pipelines, monitor model decay, and retrain models automatically using MLOps practices. You will work with large datasets using distributed computing tools like Apache Spark. A strong programming background in Python, Scala, or C++ and deep knowledge of model deployment strategies are vital.",
        requirements: ["Experience deploying ML models to production environments", "Familiarity with MLOps concepts and tools (MLflow, Kubeflow)", "Strong programming skills in Python", "Experience with deep learning frameworks (TensorFlow, Keras)"],
        salary: "₹16L - ₹24L",
        experienceLevel: "4-6 Years",
        location: "Pune, India",
        jobType: "Full-Time",
        position: 2,
        tags: ["Machine Learning", "MLOps", "Python", "Data"],
        company: getComp("Wipro"),
        created_by: user._id
      },
      {
        title: "React Native Mobile Developer",
        description: "Be part of the mobile revolution by developing cross-platform applications using React Native. You will build seamless, native-feeling mobile apps for both iOS and Android from a single codebase. You will write robust components, optimize mobile app performance, and integrate natively with device hardware like cameras and location services. This role requires someone who stays updated with the latest mobile trends and deeply cares about fluid UI animations.",
        requirements: ["Experience building and deploying React Native apps", "Familiarity with native build tools, like XCode and Gradle", "Understanding of REST APIs and offline storage", "Experience with mobile push notifications"],
        salary: "₹9L - ₹14L",
        experienceLevel: "2-3 Years",
        location: "Bangalore, India",
        jobType: "Full-Time",
        position: 3,
        tags: ["React Native", "Mobile", "iOS", "Android"],
        company: getComp("Amazon"),
        created_by: user._id
      },
      {
        title: "Golang Software Engineer",
        description: "We are seeking a Go specialist to build hyper-fast microservices designed for massive concurrent loads. You will leverage Go's powerful concurrency models (Goroutines and Channels) to process data streams and build low-latency network applications. You will be responsible for system architecture decisions and optimizing memory usage. The ideal candidate loves building reliable distributed systems and understands the nuances of networking protocols (TCP/UDP, gRPC).",
        requirements: ["Extensive experience programming in Go", "Knowledge of common Goroutine patterns", "Experience building distributed systems", "Understanding of microservices architecture"],
        salary: "₹15L - ₹22L",
        experienceLevel: "3-5 Years",
        location: "Hyderabad, India",
        jobType: "Full-Time",
        position: 1,
        tags: ["Go", "Golang", "Microservices", "Backend"],
        company: getComp("Microsoft"),
        created_by: user._id
      },
      {
        title: "DevOps Automation Engineer",
        description: "This role focuses entirely on automating our software delivery pipeline to ensure stable, predictable releases. You will build, maintain, and monitor CI/CD pipelines, integrating static code analysis and security scanning tools. You will also respond to production incidents and create automated runbooks for disaster recovery. We need someone passionate about the 'Infrastructure as Code' philosophy who treats operations problems as software engineering problems.",
        requirements: ["Experience with automation tools like Ansible, Chef, or Puppet", "Deep understanding of CI/CD concepts (GitLab CI, Jenkins)", "Knowledge of containerization technologies (Docker)", "Scripting abilities in Bash and Python"],
        salary: "₹12L - ₹18L",
        experienceLevel: "2-4 Years",
        location: "Mumbai, India",
        jobType: "Full-Time",
        position: 2,
        tags: ["DevOps", "CI/CD", "Automation", "Docker"],
        company: getComp("TCS"),
        created_by: user._id
      },
      {
        title: "Cybersecurity Analyst",
        description: "Protect our applications and infrastructure from evolving cyber threats. You will conduct regular vulnerability assessments, penetration testing, and monitor network traffic for suspicious activity. When security incidents occur, you will lead the forensic investigation and mitigation efforts. You will also work alongside developers to ensure secure coding practices are integrated into the SDLC. A deep understanding of the OWASP Top 10 and network security protocols is required.",
        requirements: ["Experience in IT security, network security or cloud security", "Knowledge of security frameworks (NIST, ISO 27001)", "Familiarity with security scanning tools", "Certifications like CompTIA Security+, CEH, or CISSP are a plus"],
        salary: "₹10L - ₹16L",
        experienceLevel: "2-4 Years",
        location: "Remote",
        jobType: "Full-Time",
        position: 1,
        tags: ["Security", "Cybersecurity", "Analyst", "Network"],
        company: getComp("Infosys"),
        created_by: user._id
      },
      {
        title: "Product Manager (Tech)",
        description: "Lead the vision and execution of our flagship technical products. You will gather requirements from stakeholders, prioritize the product backlog, and define clear, actionable user stories for the engineering team. This role requires a unique blend of business acumen and deep technical understanding, allowing you to converse fluently with both marketing executives and software architects. You will be the central hub ensuring the right product is built at the right time.",
        requirements: ["Proven experience as a Product Manager in a tech company", "Technical background with understanding of software development lifecycle", "Strong analytical and problem-solving skills", "Excellent communication and leadership abilities"],
        salary: "₹18L - ₹28L",
        experienceLevel: "4-7 Years",
        location: "Bangalore, India",
        jobType: "Full-Time",
        position: 2,
        tags: ["Product", "Management", "Agile", "Strategy"],
        company: getComp("Google"),
        created_by: user._id
      },
      {
        title: "Blockchain Developer",
        description: "Join our Web3 innovation lab to build decentralized applications (dApps) and smart contracts on Ethereum and Solana. You will write secure Solidity code, integrate backend systems with blockchain networks via Web3.js, and audit contracts for vulnerabilities. You will be exploring emerging cryptographic protocols and Layer-2 scaling solutions. A deep passion for decentralization and a meticulous approach to writing immutable code is absolutely crucial for this role.",
        requirements: ["Experience with Solidity and Ethereum smart contracts", "Understanding of blockchain architecture and cryptography", "Experience with Web3.js or Ethers.js", "Familiarity with DeFi protocols"],
        salary: "₹20L - ₹30L",
        experienceLevel: "3-5 Years",
        location: "Pune, India",
        jobType: "Full-Time",
        position: 1,
        tags: ["Blockchain", "Web3", "Solidity", "Crypto"],
        company: getComp("Wipro"),
        created_by: user._id
      },
      // Generating more jobs to reach 30
      ...Array.from({ length: 14 }).map((_, i) => ({
        title: `Software Engineer L${i+1}`,
        description: `We are looking for a dedicated Software Engineer to join our growing team. You will be responsible for developing high-quality software solutions, collaborating dynamically with cross-functional teams, and participating in the full software development lifecycle. This role requires strong problem-solving capabilities, an understanding of complex data structures, and the ability to write clean, scalable code. We offer a vibrant workplace and excellent growth opportunities.`,
        responsibilities: [
          "Design, develop, and test high-quality software solutions",
          "Collaborate dynamically with cross-functional product and design teams",
          "Participate in the full software development lifecycle from conception to deployment",
          "Write clean, scalable, and maintainable object-oriented code",
          "Troubleshoot, debug, and upgrade existing systems"
        ],
        eligibility: "B.Tech/B.E. in Computer Science or related degree. Freshers and early-career developers welcome.",
        perks: [
          "Competitive base salary with annual performance increments",
          "Comprehensive medical and dental insurance",
          "Generous learning and development budget for certifications",
          "Hybrid work policy (3 days in office, 2 days remote)",
          "Annual company retreats and team-building events"
        ],
        requirements: ["Bachelor's degree in Computer Science", "Strong knowledge of object-oriented programming", "Experience with version control (Git)", "Good communication skills"],
        salary: `₹${6 + i}L - ₹${9 + i}L`,
        experienceLevel: `${Math.floor(i/3)}-${Math.floor(i/3)+2} Years`,
        location: "Remote",
        jobType: i % 2 === 0 ? "Full-Time" : "Contract",
        position: Math.floor(Math.random()*5)+1,
        tags: ["Software", "Development", "Engineering", "Coding"],
        company: companies[i % companies.length]._id,
        created_by: user._id
      }))
    ];

    await Job.insertMany(jobs);
    console.log('30 Jobs Inserted Successfully!');

    // Outputting first 3 as preview for JSON console
    const preview = jobs.slice(0, 3).map(j => ({
        title: j.title,
        company: getCompName(j.company),
        location: j.location,
        salary: j.salary,
        type: j.jobType,
        description: j.description
    }));

    function getCompName(id) {
        return companies.find(c => c._id.toString() === id.toString()).name;
    }

    console.log(JSON.stringify(preview, null, 2));

    process.exit();
  } catch (err) {
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        console.error('Validation Errors:', messages.join(', '));
    } else {
        console.error('Insert Error:', err.message || err.toString());
    }
    process.exit(1);
  }
};

seedJobs();
