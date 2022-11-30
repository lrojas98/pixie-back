import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const Payment_settingsModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('payment_settings', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"TBK_API_KEY": {
		"type": DataTypes.TEXT
	},
	"TBK_API_KEY_SECRET": {
		"type": DataTypes.TEXT
	},
	"commission": {
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

	return model
}

export default Payment_settingsModel;