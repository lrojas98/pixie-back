import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import ServicesModel from "./services";
import Services_userModel from "./services_user";
import UsersModel from "./users";

const OffersModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('offers', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"serviceId": {
		"type": DataTypes.INTEGER
	},
	"status": {
		"type": DataTypes.TINYINT
	},
	"value": {
		"type": DataTypes.FLOAT
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
	UsersModel().hasOne(model, {
		foreignKey: 'userId'
	});

	model.belongsTo(UsersModel(), {
		foreignKey: 'userId',
		targetKey: 'id'
	});

	Services_userModel().hasOne(model, {
		foreignKey: 'serviceId'
	});

	model.belongsTo(Services_userModel(), {
		foreignKey: 'serviceId',
		targetKey: 'id'
	});

	return model
}

export default OffersModel;