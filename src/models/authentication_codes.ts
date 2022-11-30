import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Authentication_codesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('authentication_codes', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"email": {
		"type": DataTypes.TEXT
	},
	"code": {
		"type": DataTypes.TINYINT
	},
	"use": {
		"type": DataTypes.BOOLEAN
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default Authentication_codesModel;