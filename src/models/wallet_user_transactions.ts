import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Services_userModel from "./services_user";
import UsersModel from "./users";

const Wallet_user_transactionsModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('wallet_user_transactions', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"amount": {
		"type": DataTypes.FLOAT
	},
	"serviceId": {
		"type": DataTypes.INTEGER
	},
    "status": {
		"type": DataTypes.TEXT
	},
    "description": {
		"type": DataTypes.TEXT
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});

	model.hasOne(UsersModel(), {
		sourceKey: 'userId',
		foreignKey: 'id'
	});
	UsersModel().belongsTo(model);

	model.hasOne(Services_userModel(), {
		sourceKey: 'serviceId',
		foreignKey: 'id'
	});
	Services_userModel().belongsTo(model);

	return model
}

export default Wallet_user_transactionsModel;