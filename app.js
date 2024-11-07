const express = require('express'); 
const app = express();
const expressLayout = require('express-ejs-layouts') 
require('dotenv').config();
const session = require('express-session');
const {v4:uuidv4} = require('uuid');
const flash = require('connect-flash');
const methodOverride = require('method-override'); 


const connectDb = require('./server/config/db');
const userRoute = require('./server/routes/userRoute');
const adminRoute = require('./server/routes/adminRoute')

connectDb();

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');     
    next(); 
});

app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}
})) 

app.use(flash());

app.use(methodOverride('_method'));

app.use(expressLayout);
app.set('layout', './layouts/userLayout');
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));   
app.use(express.json());

app.use(express.static('public'));

app.use('/', userRoute);
app.use('/admin', adminRoute)


// Redirect root URL to the login page
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect to login page
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));



