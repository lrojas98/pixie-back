import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Service_imageModel = () => {
	return (Connection.getInstance().db as Sequelize).define('service_images', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"serviceId": {
		"type": DataTypes.INTEGER
	},
	"url": {
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

export default Service_imageModel;