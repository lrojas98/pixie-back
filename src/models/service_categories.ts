import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Service_categoriesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('service_categories', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"serviceId": {
		"type": DataTypes.INTEGER,
	},
	"categoryId": {
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

export default Service_categoriesModel;