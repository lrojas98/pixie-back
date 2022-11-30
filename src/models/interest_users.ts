import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import InterestModel from "./interest";
import UsersModel from "./users";

const Interest_usersModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('interest_users', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"interest_id": {
		"type": DataTypes.INTEGER,
	},
	"users_id": {
		"type": DataTypes.INTEGER,
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});

	InterestModel().hasOne(model, {
		foreignKey: 'interest_id'
	});

	model.belongsTo(InterestModel(), {
		foreignKey: 'interest_id',
		targetKey: 'id'
	});

	return model
}

export default Interest_usersModel;