import multer from 'multer';


// Set up the storage configuration for multer
const storage = multer.diskStorage({
    // Define the destination directory for uploaded files
    destination: function(req, file, cb) {
        // Set the destination to './public/temp'
        cb(null, './public/temp')
    },
    // Define the filename for the uploaded files
    filename: function(req, file, cb) {
        // Set the filename to the original name of the uploaded file
        cb(null, file.originalname)
    }
})


// Create an upload instance with the defined storage configuration
export const upload = multer({ storage: storage })