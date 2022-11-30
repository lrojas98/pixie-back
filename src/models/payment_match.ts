import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import MatchsModel from "./matchs";
import UsersModel from "./users";

const Payment_matchModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('payment_match', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"receiverId": {
		"type": DataTypes.INTEGER
	},
	"status": {
		"type": DataTypes.STRING
	},
	"amount": {
		"type": DataTypes.FLOAT
	},
	"transactionId": {
		"type": DataTypes.INTEGER
	},
	"matchId": {
		"type": DataTypes.INTEGER
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

	MatchsModel().hasOne(model, {
		foreignKey: 'matchId'
	});

	model.belongsTo(MatchsModel(), {
		foreignKey: 'matchId',
		targetKey: 'id'
	});

	return model
}

export default Payment_matchModel;