import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const State_servicesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('state_services', {
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
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default State_servicesModel;