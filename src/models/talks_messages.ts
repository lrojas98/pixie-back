import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Talks_messagesModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('talks_messages', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"talkUserId": {
		"type": DataTypes.INTEGER
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"channelMe": {
		"type": DataTypes.TEXT
	},
	"channelTo": {
		"type": DataTypes.TEXT
	},
	"message": {
		"type": DataTypes.JSON
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
    return model;
}

export default Talks_messagesModel;