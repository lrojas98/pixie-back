import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const RolesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('roles', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"name": {
		"type": DataTypes.STRING
	},
	"description": {
		"type": DataTypes.STRING
	},
	"status": {
		"type": DataTypes.TINYINT,
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default RolesModel;