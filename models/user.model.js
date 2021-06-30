const { DataTypes } = require("sequelize");
const db = require("../config/database");

const user = db.define(
	"user",
	{
		full_name: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
		},
		hash_password: {
			type: DataTypes.STRING,
		},
		nickname: {
			type: DataTypes.STRING,
		},
		active: {
			type: DataTypes.BOOLEAN,
		},
		create_at: {
			type: DataTypes.DATE,
		},
		avatar: {
			type: DataTypes.STRING,
		},
	},
	{
		timestamps: true,
		createdAt: "create_at",
		updatedAt: false,
		tableName: "user",
	}
);

module.exports = user;
