// Requerimientos 
const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const { body, check } = require('express-validator');

// Controlador de usuarios
const usersController = require('../controllers/usersController');

// Middlewares
const guestMiddleware = require('../middlewares/guestMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require("../middlewares/multer")  //--> Acá requerimos a toda la configuración de multer (el 'destination' y 'filename')

// Validacion de Registro
const registerValidations = [
    body('name').notEmpty(),
    body('lastName').notEmpty(),
    body('email').trim().notEmpty().isEmail(),
    body('password').notEmpty().isLength({min: 8, max: 24}),
    body('password').matches(/[A-Z]/),
    body('password').matches(/[a-z]/),
    body('password').matches(/[!@#$%^&/_*]/),
    body('confirm-password').custom((validationPassword, { req }) => {
        if (validationPassword !== req.body.password) {
          new Error('La contraseña no es la misma que se ingresó en el campo anterior');
        }
        return true;
      }),
];

// Validacion de Login
const loginValidations = [
    check('email').notEmpty().isEmail(),
    check('password').notEmpty().isLength({ min: 8 }),
];

// Register
router.get('/register', guestMiddleware,usersController.register);
router.post('/register', upload.single('imgProfile'), registerValidations, usersController.processToRegister); //-->Se guarda la imagen a través de multer, y los datos a través de Sequelize

// Login
router.get('/login', guestMiddleware, usersController.login);
router.post('/login', loginValidations, usersController.processToLogin);

// Perfil del usuario
//--> Si el usuario está logueado y quiere ingresar a su perfil, se aplica el 'authMiddleware': primero para saber si es un usuario común (con el método 'common_user') y luego para saber si
//-- está queriendo ingresar a su perfil o a otro (con el método 'profile_filter'). Si pasa ambos filtros, continúa a la ejecución del controlador, sino, es redirigido al login o al index respectivamente 
router.get('/userProfile/:id', authMiddleware.common_user,authMiddleware.profile_filter ,usersController.userProfile); 

// Editar Perfil
router.put('/userProfile/:id', /* upload.single("imgProfile") ,*/ authMiddleware.common_user, usersController.editUser); //--> Se aplica el método 'common_user' del 'authMiddleware' ('authMiddleware.common_user'),
                                                                                                                        //--si el usuario está logueado como usuario común, continúa con el controlador, si no, lo redirige al login)
/* log out */
router.get('/logOut', usersController.logOut);

module.exports = router;