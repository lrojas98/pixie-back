import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Payment_typesModel from "./payment_types";
import Services_userModel from "./services_user";

const TransactionsModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('transactions', {
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
	"paymentTypeId": {
		"type": DataTypes.INTEGER
	},
	"payInfo": {
		"type": DataTypes.JSONB
	},
	"status": {
		"type": DataTypes.STRING
	},
	"total": {
		"type": DataTypes.FLOAT
	},
	"reference_services": {
		"type": DataTypes.STRING
	},
	"token": {
		"type": DataTypes.TEXT
	},
	"paymentAt": {
		"type": DataTypes.DATE
	},
	"key": {
		"type": DataTypes.TEXT
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});

	Payment_typesModel().hasOne(model, {
		foreignKey: 'paymentTypeId'
	});

	model.belongsTo(Payment_typesModel(), {
		foreignKey: 'paymentTypeId',
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

export default TransactionsModel;