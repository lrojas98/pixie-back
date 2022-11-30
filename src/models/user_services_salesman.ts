import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const user_services_salesmanModel = () => {
	return (Connection.getInstance().db as Sequelize).define('user_services_salesman', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER,
	},
	"servicesId": {
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

export default user_services_salesmanModel;