import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Credit_cardsModel = () => {
	return (Connection.getInstance().db as Sequelize).define('credit_cards', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"users_id": {
		"type": DataTypes.INTEGER.UNSIGNED,
	},
	"token": {
		"type": DataTypes.STRING
	},
	"status": {
		"type": DataTypes.TINYINT
	},
	"main": {
		"type": DataTypes.TINYINT
	},
	"card_type": {
		"type": DataTypes.STRING
	},
	"card_number": {
		"type": DataTypes.STRING
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	},
	"paymentTypeId": {
		"type": DataTypes.INTEGER
	},
});
}

export default Credit_cardsModel;