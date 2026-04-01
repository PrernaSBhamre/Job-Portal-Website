const mongoose = require('mongoose');
require('dotenv').config();
const Company = require('./models/Company');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

const companiesData = [
    { name: "TCS (Tata Consultancy Services)", location: "Mumbai, India", description: "Global leader in IT services, consulting, and business solutions with a large network of innovation and delivery centers.", website: "https://www.tcs.com" },
    { name: "Infosys", location: "Bangalore, India", description: "Next-generation digital services and consulting offering world-class technology, enterprise architecture, and AI-driven platforms.", website: "https://www.infosys.com" },
    { name: "Wipro", location: "Bangalore, India", description: "A leading global information technology, consulting and business process services company leveraging cognitive computing, hyper-automation, robotics, cloud.", website: "https://www.wipro.com" },
    { name: "HCLTech", location: "Noida, India", description: "Empowering global enterprises with technology for the next decade today through digital, engineering and cloud capabilities.", website: "https://www.hcltech.com" },
    { name: "Tech Mahindra", location: "Pune, India", description: "Connecting customer experiences through enterprise business solutions across Telecommunications, Healthcare, and Finance.", website: "https://www.techmahindra.com" },
    { name: "Google India", location: "Bangalore, India", description: "Organizing the world's information and making it universally accessible and useful through massive scale cloud engineering.", website: "https://careers.google.com" },
    { name: "Microsoft India", location: "Hyderabad, India", description: "Empowering every person and every organization on the planet to achieve more with Azure cloud and AI capabilities.", website: "https://careers.microsoft.com" },
    { name: "Amazon India", location: "Bangalore, India", description: "Earth's most customer-centric company scaling AWS infrastructure and leading the e-commerce infrastructure globally.", website: "https://amazon.jobs" },
    { name: "Cognizant", location: "Chennai, India", description: "Transforming clients' business, operating and technology models for the digital era through human-centric approach.", website: "https://www.cognizant.com" },
    { name: "Accenture", location: "Bangalore, India", description: "A global professional services company with leading capabilities in digital, cloud and security.", website: "https://www.accenture.com" },
    { name: "IBM India", location: "Bangalore, India", description: "Leading the era of hybrid cloud and AI, solving the world's most complex challenges for enterprises.", website: "https://www.ibm.com" },
    { name: "Capgemini", location: "Pune, India", description: "A global leader in consulting, digital transformation, technology, and engineering services.", website: "https://www.capgemini.com" },
    { name: "LTIMindtree", location: "Mumbai, India", description: "A global technology consulting and digital solutions company that enables enterprises across industries to reimagine business models.", website: "https://www.ltimindtree.com" },
    { name: "Oracle India", location: "Hyderabad, India", description: "Providing integrated and autonomous cloud applications and platform services for enterprises.", website: "https://www.oracle.com" },
    { name: "Cisco Systems", location: "Bangalore, India", description: "The worldwide leader in technology that powers the Internet securely through networking, security, and cloud tech.", website: "https://www.cisco.com" },
    { name: "Salesforce", location: "Hyderabad, India", description: "The global leader in CRM, bringing companies and customers together in the digital age.", website: "https://www.salesforce.com" },
    { name: "Adobe India", location: "Noida, India", description: "Changing the world through digital experiences, empowering everyone to create and deliver powerful content.", website: "https://www.adobe.com" },
    { name: "Intuit India", location: "Bangalore, India", description: "A global technology platform that helps consumers and small businesses overcome their most important financial challenges.", website: "https://www.intuit.com" },
    { name: "Razorpay", location: "Bangalore, India", description: "The only payments solution in India that allows businesses to accept, process, and disburse payments with its product suite.", website: "https://razorpay.com" },
    { name: "Zerodha", location: "Bangalore, India", description: "India's biggest stock broker offering the lowest, cheapest brokerage rates for futures and options, commodity trading, equity and mutual funds.", website: "https://zerodha.com" },
    { name: "Zoho", location: "Chennai, India", description: "A unique and powerful software suite to run your entire business, brought to you by a company with the long term vision to transform the way you work.", website: "https://www.zoho.com" },
    { name: "Swiggy", location: "Bangalore, India", description: "India's largest online food ordering and delivery platform, scaling hyperlocal logistics.", website: "https://www.swiggy.com" },
    { name: "Zomato", location: "Gurugram, India", description: "Connecting people with great food and restaurant discovery technology.", website: "https://www.zomato.com" },
    { name: "Flipkart", location: "Bangalore, India", description: "India's leading e-commerce marketplace offering over 150 million products across 80+ categories.", website: "https://www.flipkart.com" },
    { name: "Myntra", location: "Bangalore, India", description: "India's largest e-commerce store for fashion and lifestyle products.", website: "https://www.myntra.com" },
    { name: "PhonePe", location: "Bangalore, India", description: "A mobile payments app that allows you to transfer money instantly to anyone, by using just their mobile number.", website: "https://www.phonepe.com" },
    { name: "Paytm", location: "Noida, India", description: "India's leading digital payments and financial services company targeting financial inclusion.", website: "https://paytm.com" },
    { name: "CRED", location: "Bangalore, India", description: "A members-only credit card bill payment platform that rewards its members for clearing their credit card bills on time.", website: "https://cred.club" },
    { name: "Groww", location: "Bangalore, India", description: "A financial services platform enabling individuals to invest in stocks and mutual funds made simple.", website: "https://groww.in" },
    { name: "Upstox", location: "Mumbai, India", description: "One of India's fastest-growing discount brokers, providing intuitive trading software.", website: "https://upstox.com" },
    { name: "Dream11", location: "Mumbai, India", description: "India's biggest Fantasy Sports platform with 150+ Million users.", website: "https://www.dream11.com" },
    { name: "Ola Cabs", location: "Bangalore, India", description: "One of the world's largest ride-sharing companies, integrating city transportation.", website: "https://www.olacabs.com" },
    { name: "MakeMyTrip", location: "Gurugram, India", description: "India's leading online travel company offering an extensive range of travel services and products.", website: "https://www.makemytrip.com" },
    { name: "Postman", location: "Bangalore, India", description: "An API platform for building and using APIs, simplifying each step of the API lifecycle.", website: "https://www.postman.com" },
    { name: "BrowserStack", location: "Mumbai, India", description: "The industry's most reliable web and mobile app testing platform used by over 2 million developers scaling globally.", website: "https://www.browserstack.com" },
    { name: "Freshworks", location: "Chennai, India", description: "SaaS platforms making it fast and easy for businesses to delight their customers and employees.", website: "https://www.freshworks.com" },
    { name: "InMobi", location: "Bangalore, India", description: "A global provider of enterprise platforms for marketers driving ROI and engagement.", website: "https://www.inmobi.com" },
    { name: "Byju's", location: "Bangalore, India", description: "India's largest ed-tech company and the creator of India's most loved school learning app.", website: "https://byjus.com" },
    { name: "Unacademy", location: "Bangalore, India", description: "An Indian educational technology company serving over millions of students.", website: "https://unacademy.com" },
    { name: "Lenskart", location: "Faridabad, India", description: "India's fastest growing eyewear business omnichannel retailer.", website: "https://www.lenskart.com" },
    { name: "Nykaa", location: "Mumbai, India", description: "An Indian lifestyle retail and massive e-commerce company focusing on wellness.", website: "https://www.nykaa.com" },
    { name: "Urban Company", location: "Gurugram, India", description: "Asia's largest home services platform matching consumers to highly vetted professionals.", website: "https://www.urbancompany.com" },
    { name: "Pine Labs", location: "Noida, India", description: "A prominent merchant platform company that provides financing and retail transaction technology.", website: "https://www.pinelabs.com" },
    { name: "Oyo Rooms", location: "Gurugram, India", description: "A global platform that empowers entrepreneurs and small businesses with hotels and homes.", website: "https://www.oyorooms.com" },
    { name: "Blinkit", location: "Gurugram, India", description: "India's trusted instant delivery service bringing everyday essentials to the doorstep.", website: "https://blinkit.com" },
    { name: "Zepto", location: "Mumbai, India", description: "A massive hyper-growth instant grocery delivery startup dominating modern urban logistics.", website: "https://www.zeptonow.com" },
    { name: "ShareChat", location: "Bangalore, India", description: "India's leading multilingual social media platform operating heavily in AI and machine learning.", website: "https://sharechat.com" },
    { name: "Fractal Analytics", location: "Mumbai, India", description: "A prominent AI and Analytics solutions company focused on Fortune 500 corporations.", website: "https://fractal.ai" },
    { name: "Mu Sigma", location: "Bangalore, India", description: "A decision sciences and big data analytics firm primarily serving enterprise global clients.", website: "https://www.mu-sigma.com" },
    { name: "Goldman Sachs India", location: "Bangalore, India", description: "A leading global investment banking, securities and investment management firm scaling tech engineering.", website: "https://www.goldmansachs.com" }
];

async function seedCompanies() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Seeding Companies...");

        // Ensure we have a Recruiter/Employer user for the foreign key reference
        let adminUser = await User.findOne({ email: 'seed_employer@example.com' });
        if (!adminUser) {
            adminUser = await User.create({
                fullname: "Seed Employer",
                email: "seed_employer@example.com",
                phoneNumber: 9999999999,
                password: "hashedpassword123", // Doesn't matter, won't log in
                role: "recruiter"
            });
            console.log("Created dummy employer user for foreign key.");
        }

        const userId = adminUser._id;

        console.log("Wiping existing companies...");
        await Company.deleteMany({}); // Optional: clear existing to prevent duplicates during testing

        console.log("Inserting 50 Premium Indian and Global IT Companies...");
        const payload = companiesData.map(comp => ({
            ...comp,
            userId: userId
        }));

        await Company.insertMany(payload);
        console.log("Successfully seeded", payload.length, "companies!");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding companies:", err);
        process.exit(1);
    }
}

seedCompanies();
