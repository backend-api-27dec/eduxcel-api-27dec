  const express = require('express');
const cors = require('cors');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const signupRouter = require('./routes/signup');
const signinRouter = require('./routes/signin');
const authMiddleware = require('./middleware/authMiddleware');
const profileRouter = require('./routes/profile');
const coursesRouter = require('./routes/courses');
const forgotPasswordRouter = require('./routes/forgotPassword');
const resetPasswordRouter = require('./routes/resetPassword');
const User = require('./models/User'); // Import the User model
const UserProfile = require('./models/UserProfile'); // Import the UserProfile model
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken package
const { verifyGoogleToken } = require('./middleware/authMiddleware');
const cookieParser = require('cookie-parser');
const mydb = mongoose.connection;
const fs = require('fs');

dotenv.config();
const app = express();
app.use(cookieParser());

// Configure sessions before Passport middleware
app.use(
  session({
    secret: 'fRwD8ZcX#k5H*J!yN&2G@pQbS9v6E$tA',
    resave: false,
    saveUninitialized: false,
  })
);
app.get('/', (req, res) => {
  res.cookie('cookieName', 'value', { 
    sameSite: 'None', 
    secure: true 
  });
  res.send('Cookie set successfully');
});

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB using the MONGODB_URI_MYDB environment variable
mongoose.connect(process.env.MONGODB_URI_MYDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Define your MongoDB collections (models)
const Course = require('./models/Course');
const Feedback = mongoose.model('feedback', {
  name: String,
  email: String,
  feedback: String,
});
const Query = mongoose.model('query', { name: String, email: String, query: String });

const Tools = mongoose.model('tools', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});
const Working = mongoose.model('working', {
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});
// Define schema for HTML courses
const HTMLCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Define schema for CSS courses
const CSSCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Define schema for JavaScript courses
const JavaScriptCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Define schema for Responsive Web Design courses
const ResponsiveWebDesignCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});


// Define schema for CSS Preprocessors courses
const CSSPreprocessorsCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});


// Define schema for DOM Manipulation courses
const DOMManipulationCourseSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Create models for each topic
const HTMLCourses = mongoose.model('html_courses', HTMLCourseSchema);

const CSSCourses = mongoose.model('css_courses', CSSCourseSchema);
const JavaScriptCourses = mongoose.model('javascript_courses', JavaScriptCourseSchema);
const ResponsiveWebDesignCourses = mongoose.model('responsive_web_design_courses', ResponsiveWebDesignCourseSchema);
const CSSPreprocessorsCourses = mongoose.model('css_preprocessors_courses', CSSPreprocessorsCourseSchema);
const DOMManipulationCourses = mongoose.model('dom_manipulation_courses', DOMManipulationCourseSchema);

// Export the models
module.exports = {
  HTMLCourses,
  CSSCourses,
  JavaScriptCourses,
  ResponsiveWebDesignCourses,
  CSSPreprocessorsCourses,
  DOMManipulationCourses,
};



// Define Passport strategies
passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).exec((err, user) => {
    done(err, user);
  });
});





const allowedOrigins = [
  'https://eduxcel.vercel.app',
  'http://localhost:5173',
    'https://lic-neemuch-jitendra-patidar.vercel.app',

    'https://sanjay-patidar.vercel.app',

  // Add more domains if needed
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use((req, res, next) => {
  const ipAddress = req.ip; // Get the user's IP address
  req.userIpAddress = ipAddress; // Store the IP address in the request object
  next();
});


app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, 'client/build')));

// Define your routes and APIs here
app.use('/api/signup', signupRouter);

app.use('/api/profile', authMiddleware);
app.use('/api/signin', signinRouter);

app.use('/api/profile', profileRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/forgotpassword', forgotPasswordRouter);
app.use('/api/reset-password', resetPasswordRouter);
// Define a schema for the ratings
// Define a schema for the ratings
const ratingSchema = new mongoose.Schema({
  userId: String,
  rating: Number,
});

// Define a model based on the schema
const Rating = mongoose.model('Rating', ratingSchema);

app.use(express.json());

// Endpoint to get the current ratings
app.get('/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find({});
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to update the ratings
app.post('/ratings', async (req, res) => {
  const { userId, rating } = req.body;
  try {
    const existingRating = await Rating.findOneAndUpdate(
      { userId },
      { rating },
      { upsert: true, new: true }
    );
    res.json(existingRating);
  } catch (error) {
    console.error('Error updating ratings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Received a request to update user profile');

    // Get the user ID from the authenticated user
    const userId = req.user._id;

    // Fetch the user profile based on the user ID
    let userProfile = await UserProfile.findOne({ user: userId });

    if (!userProfile) {
      console.log('User profile not found');
      return res.status(404).json({ message: 'User profile not found' });
    }
// Convert lastSignInAt to IST before sending it in the response
    userProfile.lastSignInAt = moment(userProfile.lastSignInAt).tz('Asia/Kolkata');


    // Update the user profile fields with the request body data
    userProfile = Object.assign(userProfile, req.body);

    // Save the updated user profile
    await userProfile.save();

    // Send the updated user profile as the response
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Serve profile images with caching disabled
app.get('/uploads/:filename', (req, res) => {
  res.setHeader('Cache-Control', 'no-store'); // Disable caching
  res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});


// Add a new API endpoint to fetch random blog titles
app.get('/api/random-blog-titles', async (req, res) => {
  try {
    // Fetch a random selection of 5 blog titles from the database
    const randomToolsBlogs = await Tools.aggregate([{ $sample: { size: 4 } }]);
    const randomWorkingBlogs = await Working.aggregate([{ $sample: { size: 1 } }]);

    // Combine and shuffle the titles
    const randomBlogTitles = [
      ...randomToolsBlogs.map(blog => blog.title),
      ...randomWorkingBlogs.map(blog => blog.title),
    ].sort(() => Math.random() - 0.5).slice(0, 5);

    res.json(randomBlogTitles);
  } catch (error) {
    console.error('Error fetching random blog titles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
});

app.get('/api/queries', async (req, res) => {
  try {
    const queries = await Query.find();
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: 'Error fetching queries' });
  }
});
app.get('/api/blogs/:title', async (req, res) => {
  try {
    const blogTitle = req.params.title;

    // Fetch blog content based on the provided title
    let blogContent;
    // Check for blogs in different collections
    if (req.params.collection === 'tools') {
      blogContent = await Tools.findOne({ title: blogTitle });
    } else if (req.params.collection === 'working') {
      blogContent = await Working.findOne({ title: blogTitle });
    } else {
      blogContent = await Careers.findOne({ title: blogTitle }) || await Choice.findOne({ title: blogTitle });
    }

    if (blogContent) {
      return res.json(blogContent);
    } else {
      return res.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    console.error('Error fetching blog content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  app.get('/api/:category', async (req, res) => {
    const { category } = req.params;
    try {
      let courseContent;
      // Fetch course content based on the provided category
      switch (category) {
        case 'html_courses':
          courseContent = await HTMLCourses.find().lean();
          break;
        case 'css_courses':
          courseContent = await CSSCourses.find().lean();
          break;
        case 'javascript_courses':
          courseContent = await JavaScriptCourses.find().lean();
          break;
          case 'css_frameworks_courses':
            courseContent = await CSSFrameworksCourses.find().lean();
            break;
            case 'css_preprocessors_courses':
              courseContent = await CSSPreprocessorsCourses.find().lean();
              break;
              case 'responsive_web_design_courses':
              courseContent = await ResponsiveWebDesignCourses.find().lean();
              break;
              case 'dom_manipulation_courses':
                courseContent = await DOMManipulationCourses.find().lean();
                break;
        default:
          // Check if the category matches any collection in the database
          const collection = await mydb.collection(category).find().lean();
          if (collection.length > 0) {
            courseContent = collection;
          } else {
            return res.status(404).json({ error: 'Category not found' });
          }
      }
  
      if (courseContent.length > 0) {
        return res.json(courseContent);
      } else {
        return res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



// new api for courses based on category
app.get('/api/courses/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    if (category === 'all') {
      const course = await Course.find();
      res.json(course);
    } else {
      const course = await Course.find({ category });
      res.json(course);
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Error fetching course' });
  }
});



app.post('/api/submit-feedback', async (req, res) => {
  try {
    const { name, email, feedback } = req.body;
    const newFeedback = new Feedback({ name, email, feedback });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting feedback' });
  }
});

app.post('/api/submit-query', async (req, res) => {
  try {
    const { name, email, query } = req.body;
    const newQuery = new Query({ name, email, query });
    await newQuery.save();
    res.status(201).json({ message: 'Query submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting query' });
  }
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ error: 'Error logging out' });
    }
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.get('/api/protected', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'This route is protected' });
});

app.get('/api/courses/:title/:module', async (req, res) => {
  try {
    const courseTitle = req.params.title;
    const moduleTitle = req.params.module;
    const course = await Course.findOne({ title: courseTitle });

    if (!course) {
      console.log('Course not found:', courseTitle);
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.modules || !Array.isArray(course.modules)) {
      console.log('Modules not found or not an array:', courseTitle);
      return res.status(404).json({ error: 'Modules not found' });
    }

    const module = course.modules.find(
      (module) => module.title === moduleTitle
    );

    if (!module) {
      console.log('Module not found:', moduleTitle);
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error fetching module details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to My API');
});

// Serve the React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});


// Listen for MongoDB collection events
mongoose.connection.on('collection', (collectionName) => {
  console.log(`Collection ${collectionName} changed.`);
});

// Serve the React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
