import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";
import CitiesModel from "./cities";
import CountriesModel from "./countries";
import InterestModel from "./interest";
import Interest_usersModel from "./interest_users";
import RolesModel from "./roles";
import ServicesModel from "./services";
import Services_userModel from "./services_user";
import TransactionsModel from "./transactions";
import User_imagesModel from "./user_images";
import User_rolesModel from "./user_roles";
import user_services_salesmanModel from "./user_services_salesman";

const UsersModel = () => {
	var model = (Connection.getInstance().db as Sequelize).define('users', {
	"id": {
		"type": DataTypes.UUID,
		"primaryKey": true,
		"defaultValue": DataTypes.UUIDV4,
	},
	"password": {
		"type": DataTypes.TEXT
	},
	"email": {
		"type": DataTypes.STRING
	},
	"name": {
		"type": DataTypes.STRING
	},
	"credential": {
		"type": DataTypes.STRING
	},
	"phone": {
		"type": DataTypes.STRING
	},
})

	return model;
}

export default UsersModel;