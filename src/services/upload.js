const multer = require("multer");

function uploadImage(req, res , endpoint) {
	let newName = "";
	let nameFile = "";
	const multerUpload = multer({
		storage: multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, `./public/images/${endpoint}`);
			},
			filename: function (req, file, cb) {
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				newName = uniqueSuffix + file.originalname;
				nameFile = `/images/${endpoint}/` + newName;
				console.log(newName);
				cb(null, newName);
			},
		}),
		fileFilter: (req, file, callback) => {
			if (!file.mimetype.includes("image")) {
				return callback(new Error(`Invalid file type ${file.mimetype}`));
			}
			callback(null, true);
		},
		limits: {
			fileSize: 5 * 1024 * 1024,
		},
	}).single("file");

	return new Promise((resolve, rejected) => {
		multerUpload(req, res, function (error) {
			if (error) {
				return rejected(error);
			} else {
				return resolve(nameFile);
			}
		});
	});
}

function uploadFile(req, res ) {
	let newName = "";
	let nameFile = "";
	const multerUpload = multer({
		storage: multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, "./public/profile");
			},
			filename: function (req, file, cb) {
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				newName = uniqueSuffix + file.originalname;
				nameFile = "/profile/" + newName;
				console.log(newName);
				cb(null, newName);
			},
		}),
		fileFilter: (req, file, callback) => {
			// if (!file.mimetype.includes("image")) {
			//   return callback(new Error(`Invalid file type ${file.mimetype}`));
			// }
			console.log(file.mimetype);
			callback(null, true);
		},
		limits: {
			fileSize: 30 * 1024 * 1024,
		},
	}).single("file");

	return new Promise((resolve, rejected) => {
		multerUpload(req, res, function (error) {
			if (error) {
				return rejected(error);
			} else {
				return resolve(nameFile);
			}
		});
	});
}
module.exports = {
	uploadImage,
	uploadFile
};