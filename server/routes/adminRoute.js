const express = require('express'); 
const router = express.Router();
const { homepage, 
    adminLogin, adminLoginPost, 
    adminSignup, adminSignupPost, 
    adminLogout, deleteUser,
    editUser, editUserPut,
    viewUser, addUser,
    addUserPost,
    searchUser} = require('../controller/adminController');

//home 
router.route('/')
    .get(homepage);

//login 
router.route('/login')  
    .get(adminLogin)  
    .post(adminLoginPost);

//signup   
router.route('/signup')
    .get(adminSignup)    
    .post(adminSignupPost);   

//logout     
router.route('/logout')
    .get(adminLogout);   

//edit    
router.route('/edit/:id')
    .get(editUser)
    .put(editUserPut); 

//view
router.route('/view/:id')  
    .get(viewUser);   

//add user
router.route('/add')
    .get(addUser)
    .post(addUserPost);     

//search
router.route('/search')
    .post(searchUser);

//delete    
router.route('/delete/:id')  
    .delete(deleteUser);    


module.exports = router;      