import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import UsersModel from "./users";

const CollectionModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('collection', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"userMatchId": {
		"type": DataTypes.INTEGER
	},
	"matched": {
		"type": DataTypes.TINYINT
	},
	"matchedAt": {
		"type": DataTypes.DATE
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
		as: 'User',
		targetKey: 'id'
	});

	UsersModel().hasOne(model, {
		foreignKey: 'userMatchId'
	});

	model.belongsTo(UsersModel(), {
		foreignKey: 'userMatchId',
		as: 'UserMatch',
		targetKey: 'id'
	});

	return model
}

export default CollectionModel;