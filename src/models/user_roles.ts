import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const User_rolesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('user_roles', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER,
	},
	"rolesId": {
		"type": DataTypes.INTEGER,
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default User_rolesModel;