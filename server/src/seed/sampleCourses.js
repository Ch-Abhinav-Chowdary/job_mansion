const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');
const Course = require('../models/Course');

const sampleCoursesData = [
  {
    title: 'Full Stack Web Development',
    category: 'Full Stack',
    shortDescription: 'Master the MERN stack (MongoDB, Express, React, Node.js) and build production-ready modern web applications.',
    description: 'A comprehensive, project-driven software course taking you from frontend fundamentals with React and Tailwind CSS to backend REST APIs, authentication, payment gateway integration, and cloud deployment.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80',
    price: 2499900, // ₹24,999 in paise
    discountPrice: 1999900, // ₹19,999 in paise
    duration: '4 months',
    mode: 'online',
    level: 'intermediate',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Modern JavaScript & React Fundamentals',
        topics: ['ES6+ features, closures, and async/await', 'React component architecture & hooks', 'State management and context API', 'Tailwind CSS utility styling'],
      },
      {
        title: 'Module 2: Server-Side Engineering with Node.js & Express',
        topics: ['RESTful architecture & routing', 'Middleware, JWT authentication & cookies', 'File uploads with Multer & Cloudinary', 'Central error handling and validation with Zod'],
      },
      {
        title: 'Module 3: Database Design with MongoDB & Mongoose',
        topics: ['Schema modeling and indexes', 'Aggregation pipelines and performance optimization', 'Data validation and relations', 'NoSQL security best practices'],
      },
      {
        title: 'Module 4: Payments & Production Deployment',
        topics: ['Razorpay checkout & webhook verification', 'Containerization with Docker basics', 'Deploying to Render and Vercel', 'CI/CD and domain setup'],
      },
    ],
    lessons: [
      {
        title: '01. Course Overview & Web Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. Setting up the Development Environment',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: true,
      },
      {
        title: '03. Deep Dive into React 18 & Virtual DOM',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
      {
        title: '04. Building Scalable Express REST APIs',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 4,
        isPreview: false,
      },
    ],
  },
  {
    title: 'Java Full Stack Development',
    category: 'Full Stack',
    shortDescription: 'Enterprise-grade Java backend with Spring Boot, Microservices, Hibernate, and modern React frontend.',
    description: 'Learn enterprise software development from the ground up. Master Core Java, object-oriented principles, Spring Boot 3, RESTful microservices, Spring Security, and full stack integration with React.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    price: 2699900, // ₹26,999 in paise
    discountPrice: 2199900, // ₹21,999 in paise
    duration: '5 months',
    mode: 'hybrid',
    level: 'intermediate',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Core Java & Advanced OOP',
        topics: ['JVM internals, memory management & garbage collection', 'Collections framework & generics', 'Multithreading and concurrency', 'Java 17+ features and streams API'],
      },
      {
        title: 'Module 2: Spring Boot 3 & Hibernate ORM',
        topics: ['Dependency injection & Spring core', 'Building REST controllers & validation', 'Spring Data JPA and Hibernate mappings', 'Transaction management'],
      },
      {
        title: 'Module 3: Microservices & Cloud Security',
        topics: ['Microservice architecture and API gateways', 'Spring Security 6 with JWT & OAuth2', 'Service discovery with Eureka', 'Kafka messaging fundamentals'],
      },
      {
        title: 'Module 4: Full Stack Integration & Testing',
        topics: ['JUnit 5 and Mockito unit testing', 'Connecting Spring Boot with React frontend', 'Dockerizing Spring Boot applications', 'Interview preparation & enterprise capstone'],
      },
    ],
    lessons: [
      {
        title: '01. Java Industry Landscape & Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. OOP Foundations & Modern Java Setup',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: false,
      },
      {
        title: '03. First Spring Boot REST Service',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
    ],
  },
  {
    title: 'Python for Data Science & AI',
    category: 'Data',
    shortDescription: 'From Python programming basics to data wrangling, machine learning models, and real-world predictive analytics.',
    description: 'Unlock the power of data with Python. Master NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and build end-to-end Machine Learning pipelines with real-world business datasets.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    price: 2299900, // ₹22,999 in paise
    discountPrice: 1799900, // ₹17,999 in paise
    duration: '3.5 months',
    mode: 'online',
    level: 'beginner',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Python Essentials & Data Structures',
        topics: ['Syntax, functions, and list comprehensions', 'Object-oriented programming in Python', 'Working with files, JSON, and APIs', 'Jupyter Notebook & Conda environments'],
      },
      {
        title: 'Module 2: Data Wrangling & Exploratory Analysis',
        topics: ['Numerical computing with NumPy', 'Data cleaning & manipulation with Pandas', 'Data visualization with Matplotlib & Seaborn', 'Exploratory Data Analysis (EDA) on real datasets'],
      },
      {
        title: 'Module 3: Machine Learning with Scikit-Learn',
        topics: ['Supervised learning: Regression & Classification', 'Unsupervised learning: Clustering & PCA', 'Model evaluation, cross-validation & hyperparameter tuning', 'Feature engineering and pipeline construction'],
      },
      {
        title: 'Module 4: Model Deployment & Portfolio Project',
        topics: ['Building interactive dashboards with Streamlit', 'Deploying ML models as FastAPI endpoints', 'Capstone project presentation', 'Resume and mock interviews'],
      },
    ],
    lessons: [
      {
        title: '01. Python in Industry & Data Science Career Paths',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. Setting up Python, VS Code, and Jupyter',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: true,
      },
      {
        title: '03. Pandas Deep Dive: Data Cleaning & Wrangling',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
    ],
  },
  {
    title: 'Data Analytics with Power BI & SQL',
    category: 'Data',
    shortDescription: 'Master SQL querying, Advanced Excel, and interactive Power BI business intelligence dashboards.',
    description: 'Become a job-ready Data Analyst. Learn relational database querying with complex SQL queries, window functions, data transformation with Power Query, DAX calculations, and executive BI dashboard creation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    price: 1999900, // ₹19,999 in paise
    discountPrice: 1499900, // ₹14,999 in paise
    duration: '3 months',
    mode: 'online',
    level: 'beginner',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Advanced SQL for Analytics',
        topics: ['SELECT, WHERE, JOINs (INNER, LEFT, RIGHT, FULL)', 'Aggregations, GROUP BY, and HAVING', 'Subqueries, CTEs, and Window Functions (ROW_NUMBER, RANK, LEAD/LAG)', 'Database indexing and query performance'],
      },
      {
        title: 'Module 2: Business Analytics with Excel',
        topics: ['Advanced formulas (XLOOKUP, INDEX/MATCH, SUMIFS)', 'Pivot tables and dynamic slicing', 'Data cleaning, formatting, and validation', 'Scenario analysis and financial modeling basics'],
      },
      {
        title: 'Module 3: Power BI & Data Modeling',
        topics: ['Connecting to SQL, Excel, and Web data sources', 'Data shaping with Power Query (ETL)', 'Star schema & Snowflake schema design', 'DAX measures, calculated columns, and time intelligence'],
      },
      {
        title: 'Module 4: Executive Reporting & Storytelling',
        topics: ['Designing executive dashboards with KPIs', 'Interactive drill-throughs and bookmarks', 'Publishing to Power BI Service & scheduling refresh', 'Real-world business case studies'],
      },
    ],
    lessons: [
      {
        title: '01. Introduction to Data Analytics & BI Roles',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. Installing PostgreSQL & First Complex Queries',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: false,
      },
      {
        title: '03. Building Your First Interactive Power BI Dashboard',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
    ],
  },
  {
    title: 'DevOps & Cloud Engineering',
    category: 'Cloud',
    shortDescription: 'Master Linux, Docker, Kubernetes, AWS, Terraform, and automated CI/CD deployment pipelines.',
    description: 'Bridge software engineering and operations. Gain hands-on mastery over Linux administration, container orchestration with Kubernetes, Infrastructure as Code with Terraform, AWS cloud services, and production CI/CD pipelines.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    price: 2799900, // ₹27,999 in paise
    discountPrice: 2299900, // ₹22,999 in paise
    duration: '4 months',
    mode: 'online',
    level: 'advanced',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Linux Administration & Git Workflows',
        topics: ['Linux shell scripting & command line mastery', 'User management, permissions, and networking', 'Git branching strategies, pull requests, and code reviews', 'SSH keys and secure remote administration'],
      },
      {
        title: 'Module 2: Containerization with Docker',
        topics: ['Docker architecture and Dockerfiles', 'Multi-stage builds and image optimization', 'Docker Compose for multi-container apps', 'Container security and image registries'],
      },
      {
        title: 'Module 3: Container Orchestration with Kubernetes',
        topics: ['K8s architecture: Control plane and worker nodes', 'Pods, Deployments, Services, and Ingress', 'ConfigMaps, Secrets, and Persistent Volumes', 'Helm charts and cluster monitoring'],
      },
      {
        title: 'Module 4: AWS & Infrastructure as Code (Terraform)',
        topics: ['Core AWS services (EC2, S3, RDS, VPC, IAM)', 'Provisioning infrastructure with Terraform', 'Automated CI/CD with GitHub Actions', 'Monitoring and logging with Prometheus and Grafana'],
      },
    ],
    lessons: [
      {
        title: '01. The DevOps Mindset & Cloud Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. Docker Fundamentals & Multi-Stage Builds',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: false,
      },
      {
        title: '03. Kubernetes Pods, Deployments & Services in Action',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
    ],
  },
  {
    title: 'Software Testing & QA Automation',
    category: 'Testing',
    shortDescription: 'Master Manual Testing, Selenium WebDriver with Java, Postman API Testing, and Test Automation Frameworks.',
    description: 'Transform into a full-fledged Software Quality Assurance Engineer. Master SDLC/STLC processes, test case design, automated UI testing with Selenium and TestNG, API testing with Postman and RestAssured, and CI integration.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    price: 1899900, // ₹18,999 in paise
    discountPrice: 1499900, // ₹14,999 in paise
    duration: '3 months',
    mode: 'online',
    level: 'beginner',
    isPublished: true,
    syllabus: [
      {
        title: 'Module 1: Manual Testing & QA Fundamentals',
        topics: ['SDLC and STLC models (Agile, Scrum, Waterfall)', 'Test scenarios, test case design techniques & test execution', 'Bug lifecycle and defect tracking with Jira', 'Regression, smoke, sanity, and exploratory testing'],
      },
      {
        title: 'Module 2: API Testing with Postman',
        topics: ['HTTP methods, status codes, and headers', 'Postman collections, environment variables, and tests', 'Automating API tests with Newman', 'Authentication (Bearer tokens, Basic Auth, API keys)'],
      },
      {
        title: 'Module 3: UI Automation with Selenium & Java',
        topics: ['Locators (XPath, CSS selectors, ID, Name)', 'Handling dynamic web elements, alerts, frames, and windows', 'TestNG framework: annotations, assertions, and data providers', 'Page Object Model (POM) design pattern'],
      },
      {
        title: 'Module 4: Automation Framework & CI Integration',
        topics: ['Building a data-driven automation framework from scratch', 'Reporting with ExtentReports and Allure', 'Integrating test suites into Jenkins / GitHub Actions', 'Interview questions & mock technical rounds'],
      },
    ],
    lessons: [
      {
        title: '01. Software Quality Assurance Careers & Overview',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        isPreview: true,
      },
      {
        title: '02. Writing Professional Test Cases & Jira Bug Reports',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        isPreview: true,
      },
      {
        title: '03. First Selenium Automation Script in Java',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 3,
        isPreview: false,
      },
    ],
  },
];

const seedCourses = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const courseData of sampleCoursesData) {
      const existing = await Course.findOne({ title: courseData.title });

      if (existing) {
        // Update existing sample course while preserving ID
        Object.assign(existing, courseData);
        await existing.save();
        updatedCount++;
        console.log(`Updated course: "${existing.title}" (slug: ${existing.slug})`);
      } else {
        const created = await Course.create(courseData);
        insertedCount++;
        console.log(`Inserted course: "${created.title}" (slug: ${created.slug})`);
      }
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Total courses processed: ${sampleCoursesData.length}`);
    console.log(`New courses inserted:     ${insertedCount}`);
    console.log(`Existing courses updated: ${updatedCount}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample courses:', error);
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      // ignore
    }
    process.exit(1);
  }
};

seedCourses();
