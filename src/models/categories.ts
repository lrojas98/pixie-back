import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

const CategoriesModel = () => {
	return (Connection.getInstance().db as Sequelize).define('categories', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"name": {
		"type": DataTypes.STRING
	},
	"status": {
		"type": DataTypes.TINYINT,
	},
	"display_order": {
		"type": DataTypes.TINYINT
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});
}

export default CategoriesModel;