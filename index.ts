import { Server } from "./src/server";
import { Common } from "./src/helper/common";
import { Controller } from "./src/controllers/rating_users";
import cron from "node-cron"

import * as dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/environments/.${process.env.ENV || 'local'}.env`.replace(/ /g, '')});
const server = new Server();



server.listen(port => {
    let common = new Common();
    common.showLogMessage(`Server listen in http://${process.env.HOST}:${port}`);
});