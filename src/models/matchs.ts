import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Services_userModel from "./services_user";
import UsersModel from "./users";

const MatchsModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('matchs', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.UUID
	},
	"serviceUserId": {
		"type": DataTypes.UUID
	},
	"matched": {
		"type": DataTypes.INTEGER
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"matchedAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	},
	"address": {
		"type": DataTypes.STRING
	},
	"description": {
		"type": DataTypes.TEXT
	}
});

	UsersModel().hasOne(model, {
		foreignKey: 'userId'
	});

	model.belongsTo(UsersModel(), {
		foreignKey: 'userId',
		as: 'User',
		targetKey: 'id'
	});

	Services_userModel().hasOne(model, {
		foreignKey: 'serviceUserId'
	});

	model.belongsTo(Services_userModel(), {
		foreignKey: 'serviceUserId',
		as: 'ServiceMatch',
		targetKey: 'id'
	});

	return model
}

export default MatchsModel;