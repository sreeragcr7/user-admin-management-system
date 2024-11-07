const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const { use } = require('../routes/userRoute');


// Centralized error handling function
const errorHandler = (res, error, redirectTo) => {
    console.log(error);
    return res.status(500).redirect(redirectTo, {error})
    
}

//Home page (GET)
const homepage = async (req,res) => {

    try{

        const renderData = {
            locals:{
                title:'Home-page', 
                description:'Login-System'
            }
        }

        let perPage = 10;
        let page = req.query.page || 1

        const user = await User.aggregate([{$sort:{updatedAt:-1}}])
        .skip(perPage * page - perPage).limit(perPage).exec()
        const count = await User.countDocuments()

        if(req.session.adminId){
            res.render('admin/home', { layout: './layouts/adminLayout',
            renderData,
            user,
            current:page,
            pages:Math.ceil(count/perPage)
            });
        }else{
            res.redirect('/admin/login')
        }

    }catch (error) {
        errorHandler(res, 'Error rendering Home page.', 'page-500');
    };

};


//Login (GET)
const adminLogin = async (req,res) => { 

    try{

        if(req.session.adminId){
            return res.redirect('/admin');
        };

        const renderData = {
            errorMessage: req.session.errorMessage || null,
            username: req.session.username || '',
            locals:{
                 title:'Login-page', 
                description:'Login-System'
            }
        };

        delete req.session.errorMessage;
        delete req.session.username;

        res.render('admin/login', {renderData, layout:false});

    }catch(error){
        errorHandler(res, 'Error rendering login page', 'page-500');
    };
};


//Login (POST)
const adminLoginPost = async (req,res) => {

    try{

        const {username, password} = req.body;

        if(!username || !password){
            req.session.errorMessage = 'Please provide both username and password.';
            req.session.username = username;
            return res.redirect('/admin/login');
        }

        //check if user exist
        const admin = await Admin.findOne({name: username});
        if(!admin){
            req.session.errorMessage = 'Admin not found.';
            req.session.username = username;
            return res.redirect('/admin/login');
        }

        //comparing entered pswd with hashed pswd
        const isMatch = await bcrypt.compare(password, admin.password);

        if(isMatch){

            req.session.adminId = admin._id;
            delete req.session.username;
            return res.redirect('/admin');
        }else{
            req.session.errorMessage = 'Incorrect password!';
            req.session.username = username;
            return res.redirect('/admin/login');
        }

    }catch (error) {
        errorHandler(res, 'Error processing login request.', 'page-500');
    }
}

//Signup (GET)
const adminSignup = async (req,res) => {

    try{

        if(req.session.adminId){
            return res.redirect('/admin/login');
        }

        const renderData = {
            errorMessage: req.session.errorMessage || null,
            username: req.session.username || '',
            locals:{
                title:'Signup-page', 
                description:'Login-System'
            }
        }

        delete req.session.errorMessage;
        delete req.session.username;

        res.render('admin/signup', {renderData, layout: false})


    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
};


//Signup (POST)
const adminSignupPost = async (req, res) => {

    try{

        const {username, password} = req.body;

        if(!username || !password){
            req.session.errorMessage = 'Please provide both username and password'
            req.session.username = username
            return res.redirect('/admin/signup');
        }

        const minLen = 8;
        if(password.length < minLen){
            req.session.errorMessage = `Password must be atleast ${minLen} character long`;
            req.session.username = username;
            return res.redirect('/admin/signup');
        }

        const existingAdmin = await Admin.findOne({name: username});

        if(existingAdmin){
            req.session.errorMessage = 'Admin alredy exist please enter different username.';
            req.session.username = username;
            return res.redirect('/admin/signup');
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);

        await Admin.create({name:username, password:hashedPassword})

        req.session.errorMessage = null;
        req.session.username = null;
        res.redirect('/admin');


    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}


//logout (GET)

const adminLogout = async (req, res) => {

    try{

        req.session.destroy(err => {
            if(err){
                return res.status(500).json({error:'Could not logout'})
            }else{
            res.redirect('/admin/login')
            }
        })

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}


//edit user (GET)
const editUser = async (req,res) => {

    try{

        const user = await User.findOne({_id: req.params.id});

        const renderData = {
            locals:{
            title: 'Edit user data',
            description: 'Login system'
            }
        }

        res.render('admin/editUser', {
            renderData,
            user, layout: './layouts/adminLayout'
        })

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}

//edit user (PUT)
const editUserPut = async (req,res) => {

    try{

        await User.findByIdAndUpdate(req.params.id, {
            name:req.body.username,
            email:req.body.email,
            updatedAt:Date.now()
        })

        res.redirect(`/admin/edit/${req.params.id}`)
        console.log('redirected');

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}


//view user (GET)
const viewUser = async (req,res) => {

    try{

        const user = await User.findOne({_id: req.params.id});

        const renderData = {
            locals:{
                title:'View user data',
                description:'User management system'
            }
        };

        res.render('admin/viewUser',{
            renderData,
            user,
            layout:'./layouts/adminLayout'
        })

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}


//add user (GET)
const addUser = async (req,res) => { 

    try{

        const renderData = {
            locals:{
                title:'View user data',
                description:'User management system' 
            }
        };

        res.render('admin/addUser', {renderData, layout: './layouts/adminLayout' });

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}

//add user (POST)
const addUserPost = async (req, res) => {

    try {

        const user = new User({ 
            name:req.body.username,
            email:req.body.email
        })

        await User.create(user)
        

        res.redirect('/admin')

        // const {username, email} = req.body; 

        // if(!username || !email){
        //     req.session.errorMessage =  'Please provide both username and email.'
        //     return res.redirect('/admin/add')
        // }

        // const user = new User({
        //     name:username,
        //     email:email
        // })

        // await user.save();

        // req.session.message = 'New user Added'
        // res.redirect('/admin')
        
    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
}

//search (GET)
const searchUser = async (req, res) => {

    try{

        renderData = {
            locals:{
                title: 'Search customer data',
                description: 'user management system' 
            }
        };

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const user = await User.find({name:{$regex: new RegExp(searchNoSpecialChar, 'i')}});

        res.render('search', {
            user,
            renderData,
            layout: './layouts/adminLayout'
        });



    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }

};

//delete user (DELETE)
const deleteUser = async (req,res) => {

    try{

        await User.deleteOne({_id: req.params.id});
        res.redirect('/admin')

    }catch (error) {
        errorHandler(res, 'Error rendering signup page.', 'page-500');
    }
};

module.exports = {homepage, 
    adminLogin, adminLoginPost, 
    adminSignup, adminSignupPost, 
    adminLogout, deleteUser,
    editUser, editUserPut, viewUser, 
    addUser, addUserPost, searchUser};  