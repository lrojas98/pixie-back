import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import Services_userModel from "./services_user";

const Favorite_servicesModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('favorite_services', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"serviceUserId": {
		"type": DataTypes.INTEGER
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	}
});

    model.belongsTo(Services_userModel(), {
        foreignKey: 'serviceUserId',
        targetKey: 'id'
    });

    Services_userModel().hasMany(model, {
        foreignKey: 'serviceUserId'
    });

    return model
}

export default Favorite_servicesModel;