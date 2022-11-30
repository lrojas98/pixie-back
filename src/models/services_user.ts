import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import CategoriesModel from "./categories";
import ServicesModel from "./services";
import Service_categoriesModel from "./service_categories";
import State_servicesModel from "./state_services";

const Services_userModel = () => {
	var model =  (Connection.getInstance().db as Sequelize).define('services_users', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"userId": {
		"type": DataTypes.INTEGER
	},
	"stateServiceId": {
		"type": DataTypes.INTEGER
	},
	"services_id": {
		"type": DataTypes.INTEGER
	},
	"value": {
		"type": DataTypes.FLOAT
	},
	"status": {
		"type": DataTypes.INTEGER
	},
	"description": {
		"type": DataTypes.STRING
	},
	"image_user": {
		"type": DataTypes.STRING
	},
	"reference_payment":{
		"type": DataTypes.STRING
	},
	"dateService": {
		"type": DataTypes.DATE
	},
	"createdAt": {
		"type": DataTypes.DATE
	},
	"updatedAt": {
		"type": DataTypes.DATE
	},
	"latitude": {
		"type": DataTypes.FLOAT
	},
	"longitude": {
		"type": DataTypes.FLOAT
	}
});

	ServicesModel().hasOne(model, {
		foreignKey: 'services_id'
	});

	model.belongsTo(ServicesModel(), {
		foreignKey: 'services_id',
		targetKey: 'id'
	});

	State_servicesModel().hasOne(model, {
		foreignKey: 'stateServiceId'
	});

	model.belongsTo(State_servicesModel(), {
		foreignKey: 'stateServiceId',
		targetKey: 'id'
	});

	model.belongsToMany(CategoriesModel(),{
		through:Service_categoriesModel(),
		as: 'Categories',
		foreignKey: {
			name: 'serviceId'
		},
		otherKey: {
			name: 'categoryId'
		},
	});

	return model;
}

export default Services_userModel;