import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const CountriesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('countries', {
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
	"iso": {
		"type": DataTypes.STRING
	},
	"currency": {
		"type": DataTypes.STRING
	},
	"status": {
		"type": DataTypes.TINYINT
	},
	"imageUrl": {
		"type": DataTypes.TEXT
	}
});
}

export default CountriesModel;