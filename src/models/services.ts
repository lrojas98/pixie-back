import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const ServicesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('services', {
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
	},
	"imageUrl": {
		"type": DataTypes.TEXT
	}
});
}

export default ServicesModel;