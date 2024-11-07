const express = require('express');
const router = express.Router();
const { homePage, notFound, 
      login, serverErr, 
      loginPost, signup, logout, 
      signupPost} = require('../controller/userController');


//Home route
router.route('/home')
      .get(homePage);

//Login route
router.route('/login')
      .get(login)    
      .post(loginPost);  

router.route('/signup')
      .get(signup)  
      .post(signupPost);
      
router.route('/logout')
      .get(logout);   

//404 route
router.route('/notFound')    
      .get(notFound);  

//500 route
router.route('/serverErr')  
      .get(serverErr);    



 
module.exports = router;      