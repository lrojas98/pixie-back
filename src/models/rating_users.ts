import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Rating_usersModel = () => {
	return (Connection.getInstance().db as Sequelize).define('rating_users', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"matchId": {
		"type": DataTypes.INTEGER
	},
	"qualification": {
		"type": DataTypes.FLOAT,
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	},
	"calificatorId": {
		"type": DataTypes.INTEGER
	}
});
}

export default Rating_usersModel;