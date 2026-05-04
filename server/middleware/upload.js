const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory to parse them easily
const upload = multer({ storage: storage });

module.exports = upload;
