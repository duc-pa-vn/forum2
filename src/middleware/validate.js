const create_res = require("../common/create_res");
const joi = require("joi");
const User = require("../../models/user.model");
// const { required } = require("joi");
// const { Op } = require("sequelize");

const checkRegister = async (req, res, next ) => {
	const schema = joi.object().keys({
		full_name: joi.string().regex(new RegExp('^[a-zA-Z\\s]{1,}$')).required(),
		email: joi.string().email().required(),
		nickname: joi.string().regex(new RegExp('^[a-zA-Z0-9\\s]{1,}$')).required(),
		password: joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,}$')).required()
	});
	try {
		const value = await schema.validateAsync(req.body);
		if(value){
			User.findOne({
				where: {
					email: req.body.email
				}
			}).then(user => {
				if(!user){
					User.findOne({
						where: {
							nickname: req.body.nickname
						}
					}).then(user => {
						if(!user) next()
						else{
							let message = {
								message: "nickname existed"
							}
							return res.send(create_res.sendSuccess(message))
						}
					}).catch(err => {
						console.log(err)
						return res.send(create_res.sendError())
					})
				}
				else{
					let message = {
						message: "email existed"
					}
					return res.send(create_res.sendSuccess(message))
				}
			}).catch(err => {
				console.log(err)
				return res.send(create_res.sendError())
			})
		}
	}
	catch (err) {
		let message
		if(err.details[0].message.search("full_name") != -1){
			message = {
				message: "fullname chi gom chu cai"
			}
		}
		else if(err.details[0].message.indexOf("email") != -1){
			message = {
				message: "nhap dung dinh dang email"
			}
		} 
		else if(err.details[0].message.indexOf("password") != -1){
			message = {
				message: "password phai co it nhat 8 ky tu gom chu cai va chu so"
			}
		}
		else if(err.details[0].message.indexOf("nickname") != -1){
			message = {
				message: "nickname chi bao gom chu cai va chu so"
			}
		}
		else{
			message = {
				message: "something wrong"
			}
		}
		console.log(err.details[0].message)
		res.send(create_res.sendSuccess(message))
	}
};

const checkRepeatPassword = async (req, res, next) => {
	const schema = joi.object().keys({
		password: joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,}$')).required(),
		repeat_password: joi.ref('password')
	})
	try{
		const value = await schema.validateAsync(req.body)
		if(value) next()
	}
	catch(err){
		console.log(err)
		res.send(err)
	}
};

module.exports = {
	checkRegister,
	checkRepeatPassword
};