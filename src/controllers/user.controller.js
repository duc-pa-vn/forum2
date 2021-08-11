const User  = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const create_res = require("../common/create_res");
const s3 = require("../common/s3");
const uploadS = require("../services/upload");

require("dotenv").config();

const register = async (req, res) => {
	console.log(req.body);
	var hash_password = await bcrypt.hash(
		req.body.password.toString().trim(),
		10
	);
	// console.log(hash_password);
	var user_item = {
		full_name: req.body.full_name,
		email: req.body.email,
		hash_password,
		nickname: req.body.nickname,
		active: req.body.active,
		avatar: null,
	};
	User.findOne({
		email: req.body.email
	}).then(user => {
		if(user == null){
			User.findOne({
				nickname: req.body.nickname
			}).then(user => {
				if(!user) {
					User.create(user_item)
					.then((user) => {
						// getVerifyEmail(user.nickname, user.email, "signup");
						let message = {
							message: "add successfully. An email sent. Verify email to active",
						};
						res.status(200)
						res.send(create_res.sendSuccess(message));
					})
					.catch((err) => {
						console.log(err);
						res.status(500)
						res.send(create_res.sendError(500,null,err));
					});
				}
				else{
					let message = {
						message: "nickname existed"
					}
					res.status(400)
					return res.send(create_res.sendError(400,null,message.message))
				}
			}).catch(err => {
				console.log(err)
				res.status(500)
				return res.send(create_res.sendError(500,null,err))
			})
		}
		else{
			let message = {
				message: "email existed",
			}
			// console.log(user)
			res.status(400)
			return res.send(create_res.sendError(400,null,message.message))
		}
	}).catch(err => {
		console.log(err)
		res.status(500)
		return res.send(create_res.sendError(500,null,err))
	})
};

const login = (req, res) => {
	console.log(req.body)
	var email = req.body.email.toString();
	var password = req.body.password.toString();
	User.findOne({
		where: {
			email,
		},
	})
		.then((user) => {
			if (user) {
				bcrypt.compare(password, user.hash_password, (err, suc) => {
					if (err) {
						console.log(err);
						res.status(500)
						return res.send(create_res.sendError(500,null,err));
					}
					if (suc) {
						if (user.active === false) {
							getVerifyEmail(user.nickname, user.email, "signup");
							let message = {
								message: "An email sent. Active your account",
							};
							// message = JSON.stringify(message);
							res.status(200)
							res.send(create_res.sendSuccess(message));
						} else {
							// let refresh_token = jwt.sign({nickname}, process.env.REFRESH_TOKEN, {expiresIn: '20h'});
							let token = jwt.sign(
								{ email, avatar: user.avatar },
								process.env.LOGIN_TOKEN,
								{ expiresIn: "17h" }
							);
							token = {
								token,
							};
							res.status(200)
							res.send(create_res.sendSuccess(token));
						}
					} else {
						let message = {
							message: "wrong password",
						};
						res.status(400)
						res.send(create_res.sendError(400,null,message.message));
					}
				});
			} else {
				let message = {
					message: "email doesn't exist",
				};
				res.status(400)
				res.send(create_res.sendError(400,null,message.message));
			}
		})
		.catch((err) => {
			console.log(err);
			res,status(500)
			res.send(create_res.sendError(500,null,err));
		});
};

const verifyEmail = (req, res) => {
	let token = req.params.token;
	jwt.verify(token, process.env.SIGN_UP_TOKEN, (err, user) => {
		if (err) {
			console.log(err);
			res.status(500)
			res.send(create_res.sendError(500,null,err));
		} else {
			User.update(
				{ active: true },
				{
					where: {
						nickname: user.nickname,
					},
				}
			)
				.then(() => {
					let message = {
						message: "active",
					};
					res.status(200)
					res.send(create_res.sendSuccess(message));
				})
				.catch((err) => {
					console.log(err);
					res.status(500)
					res.send(create_res.sendError(500,null,err));
				});
		}
	});
};

const checkRecoverToken = (req, res) => {
	let token = req.params.token;
	jwt.verify(token, process.env.RECOVER_TOKEN, (err, user) => {
		if (err) {
			console.log(err);
			res.status(500)
			res.send(create_res.sendError(500,null,err));
		} else {
			let message = {
				nickname: user.nickname,
				message: "redirect to recover page",
			};
			res.status(200)
			res.send(create_res.sendSuccess(message));
		}
	});
};

function getVerifyEmail(nickname, email, type) {
	let html;
	let token;
	if (type === "signup") {
		token = jwt.sign({ nickname }, process.env.SIGN_UP_TOKEN, {
			expiresIn: "17m",
		});
		html = `<p>click this link to confirm your email:</p><a href="http://localhost:6969/user/verify/${token}">click here</a>`;
	} else if (type === "recover") {
		token = jwt.sign({ nickname }, process.env.RECOVER_TOKEN, {
			expiresIn: "17m",
		});
		html = `<p>click this link to change password:</p><a href="http://localhost:6969/user/recover/${token}">click here</a>`;
	}
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL, // TODO: your gmail account
			pass: process.env.EPW, // TODO: your gmail password
		},
	});

	// Step 2
	let mailOptions = {
		from: "dauxanhmaunau@gmail.com", // TODO: email sender
		to: email, // TODO: email receiver
		subject: "Nodemailer - Test",
		html,
		// text: `click this link to confirm: localhost:6969/user/verify/${token}`
	};

	// Step 3
	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			return console.log(err);
		}
		return console.log("Email sent!!!");
	});
}

const forgotPassword = (req, res) => {
	const nickname = req.body.nickname;
	User.findOne({
		where: {
			nickname,
		},
	})
		.then((user) => {
			if (user) {
				getVerifyEmail(user.nickname, user.email, "recover");
				let message = {
					message: "a link to recover your password sent.",
				};
				res.status(200)
				res.send(create_res.sendSuccess(message));
			} else {
				let message = {
					message: "nickname doesn't exist",
				};
				res.status(400)
				res.send(create_res.sendError(400,null,message.message));
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500)
			res.send(create_res.sendError(500,null,err));
		});
};

const recoverPassword = async (req, res) => {
	try {
		var hash_password = await bcrypt.hash(
			req.body.password.toString().trim(),
			10
		);
		var nickname = req.body.nickname;
	} catch (err) {
		console.log(err);
		res.status(500)
		res.send(create_res.sendError(500,null,err));
	}

	User.update(
		{ hash_password },
		{
			where: {
				nickname,
			},
		}
	)
		.then(() => {
			let message = {
				message: "recover successfully",
			};
			res.status(200)
			res.send(create_res.sendSuccess(message));
		})
		.catch((err) => {
			console.log(err);
			res.status(500)
			res.send(create_res.sendError(500,null,err));
		});
};

const changeAvatar = async (req, res) => {
	try {
		let nameFile = await uploadS.uploadImage(req, res, "avatar");
		if (nameFile) {
			const file = req.file;
			console.log(file);
			const result = await s3.uploadFile(file);
			console.log(result);
			let avatar = result.key;
			let nickname = req.body.nickname;
			User.update(
				{ avatar },
				{
					where: {
						nickname,
					},
				}
			);
			let message = {
				message: "avatar was updated",
			};
			res.status(200)
			res.send(create_res.sendSuccess(message));
		} else {
			let message = {
				message: "update fail",
			};
			res.status(400)
			res.send(create_res.sendError(400,null,message.message));
		}
	} catch (err) {
		console.log(err);
		res.status(500)
		return res.send(create_res.sendError(500,null,err));
	}
};

const getTest = (req, res) => {
	User.find({})
		.then( user => {
			res.send(user)
		})
		.catch( err => {
			console.log(err)
			res.send(err)
		})
}

const delUser = (req, res) => {
	// console.log(req)
	User.deleteOne({
		nickname: req.body.nickname
	})
	.then( () => res.send({message:'ok'}))
	.catch( err => res.send(err))
}

module.exports = {
	register,
	login,
	verifyEmail,
	getVerifyEmail,
	forgotPassword,
	checkRecoverToken,
	recoverPassword,
	changeAvatar,
	getTest,
	delUser
};
