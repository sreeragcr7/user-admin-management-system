
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
 

// Centralized error handling function
const errorHandler = (res, error, redirectTo) => {
    console.log(error);
    return res.status(500).redirect(redirectTo,{error})
    
}

//User login (GET)
const login = async (req,res) => {

     try{

        res.setHeader('Cache-Control','no-store');

        if(req.session.userId){
           return res.redirect('/home');
        }

        const renderData = {
            errorMessage: req.session.errorMessage || null,
            username: req.session.username || '',
            locals:{
                title:'Login-page', 
                description:'Login-System'
            }
        }
       
        delete req.session.errorMessage;
        delete req.session.username;

        res.render('user/login', {renderData, layout:false,});


     }catch (error) {
        errorHandler(res, 'Error rendering login page.', 'page-500');
    }

}

//User login (POST)
const loginPost = async (req,res) => {

    try{

        const {username, password} = req.body;

        if(!username || !password){
            req.session.errorMessage = 'Please provide both username and password.';
            req.session.username = username;
            return res.redirect('/login');
        }

        //check if user exist
        const user = await User.findOne({name: username});
        if(!user){ 
            req.session.errorMessage = 'User not found.';
            req.session.username = username;
            return res.redirect('/login');
        }

        //comparing entered pswd with hashed pswd
        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){

            // If login is successful, handle the session setup or redirection
            req.session.userId = user._id;
            req.session.username = null;
            return res.redirect('/home');
        }else{
            req.session.errorMessage = 'Incorrect password!';
            req.session.username = username;
            return res.redirect('/login');
        }

    }catch (error) {
        errorHandler(res, 'Error processing login request.', 'page-500');
    }
}


//Signup (GET)
const signup = async (req,res) => {

    try{

        res.setHeader('Cache-Control', 'no-store');

        if(req.session.userId){
            return res.redirect('/login');
        }

        const renderData = {
            errorMessage: req.session.errorMessage || null,
            username: req.session.username || '',
            email: req.session.email || '',
            locals:{
                title:'Signup-page', 
                description:'Login-System'
            }
        }

        delete req.session.errorMessage;
        delete req.session.username;
        delete req.session.email;

        res.render('user/signup', {renderData, layout:false,})


    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
};


//Signup (POST)
const signupPost = async (req,res) =>{

    try{

        const {username, password, email} = req.body;

        if(!username || !password){
            req.session.errorMessage = 'Please provide both username and password';
            req.session.username = username;
            req.session.email = email;
            return res.redirect('/signup');
        }

        if(!email){
            req.session.errorMessage = 'Please provide your email Id'
            return res.redirect('/signup')
        }

        const minLen = 8;
        if(password.length < minLen){
            req.session.errorMessage = `Password must be atleast ${minLen} character long`;
            req.session.username;
            req.session.email = email;
            return res.redirect('/signup');
        }

        const existingEmail = await User.findOne({email: email})
        if(existingEmail){
            req.session.errorMessage = 'Email alredy exist please enter different email.';
            req.session.username = username;
        }
        const existingUser = await User.findOne({name: username})

        if(existingUser){
            req.session.errorMessage = 'User alredy exist please enter different username.';
            req.session.username = username;
            req.session.email = email;
            return res.redirect('/signup');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        await User.create({name: username, email: email, password: hashedPassword});

        req.session.errorMessage = null;
        req.session.username = null;
        res.redirect('/home');

        
    }catch (error) {
        errorHandler(res, 'Error processing signup request.', 'page-500');
    }
}

//User home page (GET)
const homePage = async (req, res) => {

    try{

        res.setHeader('Cache-Control', 'no-store');

       if(req.session.userId){
            res.render('user/home', { 
                locals:{
                    title:'Home page',
                    description:'Login-System'
                }
            });
       }else{
        res.redirect('/login')
       }

    } catch (error) {
        errorHandler(res, 'Error rendering home page.', 'page-500');
    }
}

//Logout (GET)
const logout = async (req,res) => {

    try{

        req.session.destroy(err => {
            if(err){
                return res.status(500).json({error:'Could not logout.'})
            }
            res.redirect('/login');
        })

    }catch (error) {
        errorHandler(res, 'Error processing logout request.', 'page-500');
    }
}


//404 (GET)
const notFound = async (req,res) => {

    try{

        return res.status(404).render('page-404', {layout:false});

    }catch(error){
        console.log('Error rendering page-404 ', error);
        res.status(500).render('page-500', {error: 'Error displaying 404 page'});
    }
}
//500 (GET)
const serverErr = async (req,res) => {

    try{

        return res.status(500).render('page-500',{layout:false});

    }catch(error){
        console.log('Error rendering page-500', error);
        res.status(500).send('An unexpected error occured');
    }
}

module.exports = {homePage,
     login, loginPost, 
    signup, signupPost , 
    logout, serverErr, notFound}

