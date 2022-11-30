import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const User_imagesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('user_images', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"url": {
		"type": DataTypes.TEXT
	},
	"public": {
		"type": DataTypes.INTEGER
	},
	"valid": {
		"type": DataTypes.INTEGER
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default User_imagesModel;