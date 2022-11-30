import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Payment_matchModel from "./payment_match";

const User_notificationModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('user_notifications', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"key": {
		"type": DataTypes.STRING
	},
	"tittle": {
		"type": DataTypes.TEXT
	},
	"body": {
		"type": DataTypes.TEXT
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"receiverId": {
		"type": DataTypes.INTEGER
	},
	"status": {
		"type": DataTypes.TINYINT
	},
    "tokenfcm": {
        "type": DataTypes.TEXT
    },
	"matchId": {
		"type": DataTypes.INTEGER
	},
    "createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	},
});

	Payment_matchModel().hasOne(model, {
		foreignKey: 'matchId'
	});

	model.belongsTo(Payment_matchModel(), {
		foreignKey: 'matchId',
		targetKey: 'matchId'
	});

	return model
}

export default User_notificationModel;