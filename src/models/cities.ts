import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const CitiesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('cities', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"code": {
		"type": DataTypes.STRING
	},
	"name": {
		"type": DataTypes.STRING
	},
	"status": {
		"type": DataTypes.TINYINT,
	},
	"countriesId": {
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

export default CitiesModel;