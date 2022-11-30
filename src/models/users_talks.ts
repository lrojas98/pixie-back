import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Talks_messagesModel from "./talks_messages";

const Users_talksModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('users_talks', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"userServiceId": {
		"type": DataTypes.INTEGER
	},
	"paymentMatchId": {
		"type": DataTypes.INTEGER
	},
	"status": {
		"type": DataTypes.BOOLEAN
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});

    Talks_messagesModel().hasMany(model, {
        foreignKey: 'id'
    });

    model.belongsTo(Talks_messagesModel(), {
        foreignKey: 'id',
        targetKey: 'talkUserId'
    });

    return model;

}

export default Users_talksModel;