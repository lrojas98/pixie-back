import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import UsersModel from "./users";
import Wallet_user_transactionsModel from "./wallet_user_transactions";

const Wallet_amount_userModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('wallet_amount_users', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"credential": {
		"type": DataTypes.TEXT
	},
	"savings_account": {
		"type": DataTypes.TEXT
	},
    "mobile_phone": {
		"type": DataTypes.TEXT
	},
    "balance": {
		"type": DataTypes.FLOAT
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});


	model.hasMany(Wallet_user_transactionsModel(), {
		sourceKey: 'userId',
		foreignKey: 'userId'
	});

	Wallet_user_transactionsModel().belongsTo(model);

	model.hasOne(UsersModel(), {
		sourceKey: 'userId',
		foreignKey: 'id'
	});
	UsersModel().belongsTo(model);

	return model
}

export default Wallet_amount_userModel;