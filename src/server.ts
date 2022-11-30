import { createServer, Server as HTTPServer } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import { Sequelize } from "sequelize";
import { Connection } from "./db/connection";

// Middlewares
import { ErrorMiddleware } from "./middleware/errorHandler";
import { NotFoundMiddleware } from "./middleware/notFoundHandler";

// Rutas
import authRoutes from "./routes/auth";
import citiesRoutes from "./routes/cities";
import countriesRoutes from "./routes/countries";
import usersRoutes from "./routes/users";
import user_imagesRoutes from "./routes/user_images";
import rolesRoutes from "./routes/roles";
import user_rolesRoutes from "./routes/user_roles";
import state_servicesRoutes from "./routes/state_services";
import servicesRoutes from "./routes/services";
import services_userRoutes from "./routes/services_user";
import payment_typesRoutes from "./routes/payment_types";
import transactionsRoutes from "./routes/transactions";
import matchsRoutes from "./routes/matchs";
import offersRoutes from "./routes/offers";
import credit_cardsRoutes from "./routes/credit_cards";
import interestRoutes from "./routes/interest";
import collectionRoutes from "./routes/collection";
import interest_usersRoutes from "./routes/interest_users";
import user_services_salesmanRoutes from "./routes/user_services_salesman";
import categoriesRoutes from "./routes/categories";
import favorite_servicesRoutes from "./routes/favorite_services";
import payment_matchRoutes from "./routes/payment_match";
import user_notificationsRoutes from "./routes/user_notifications";
import rating_usersRoutes from "./routes/rating_users";
import users_talksRoutes from "./routes/users_talks";
import payment_settingsRoutes from "./routes/payment_settings";
import wallet_amount_userRoutes from "./routes/wallet_amount_user";
import wallet_user_transactionsRoutes from "./routes/wallet_user_transactions";
import path from "path"
import ServerIo from "socket.io"
import { Controller } from "./controllers/users_talks";

export class Server {

    private app: Application = express();
    private httpServer: HTTPServer = createServer(this.app);

    private initialize(): void {

        // Inicia la configuración de la app
        this.initApp();
        this.configureRoutes();
        this.dbConnection();
        // Inicia los middelwares
        this.mountMiddlewares();
    }

    /**
     * Inicia la aplicación
     */
    private initApp(): void {

        this.app.disable("x-powered-by");
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors({
            exposedHeaders: ['Authorization', 'authorization', 'Content-Length'],
        }));

        // Establece las respuestas del header
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            next();
        });
    }

    async dbConnection(){
        try {
            await (Connection.getInstance().db as Sequelize).authenticate();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Establece las rutas
     */
    private mountMiddlewares(): void {

        const errorMid = new ErrorMiddleware();
        const notFound = new NotFoundMiddleware();

        // 404
        this.app.use(notFound.notFountHandler);

        // Manejo de errores
        this.app.use(errorMid.logErrors);
        this.app.use(errorMid.wrapErrors);
        this.app.use(errorMid.errorHandler);
    }

    /**
     * Inicia las rutas
     */
    private configureRoutes(): void {
        const io = new ServerIo.Server(this.httpServer, {
            path: '/piuts/socket.io',
            cors: {
                origin: true,
                methods: ["GET", "POST"],
                credentials: true
            }
        });

		this.app.use("/pixie/api/users", usersRoutes);
		this.app.use("/piuts/api/user_images", user_imagesRoutes);
		this.app.use("/piuts/api/roles", rolesRoutes);
		this.app.use("/piuts/api/user_roles", user_rolesRoutes);
		this.app.use("/piuts/api/state_services", state_servicesRoutes);
		this.app.use("/piuts/api/services", servicesRoutes);
		this.app.use("/piuts/api/services_user", services_userRoutes);
		this.app.use("/piuts/api/payment_types", payment_typesRoutes);
		this.app.use("/piuts/api/transactions", transactionsRoutes);
		this.app.use("/piuts/api/matchs", matchsRoutes);
		this.app.use("/piuts/api/offers", offersRoutes);
		this.app.use("/piuts/api/credit_cards", credit_cardsRoutes);
		this.app.use("/piuts/api/interest", interestRoutes);
		this.app.use("/piuts/api/collection", collectionRoutes);
		this.app.use("/piuts/api/interest_users", interest_usersRoutes);
        this.app.use("/piuts/api/user_services_salesman", user_services_salesmanRoutes);
        this.app.use("/piuts/api/categories", categoriesRoutes);
        this.app.use("/piuts/api/favorite_services", favorite_servicesRoutes);
        this.app.use("/piuts/api/payment_match", payment_matchRoutes);
        this.app.use("/piuts/api/user_notifications", user_notificationsRoutes);
        this.app.use("/piuts/api/rating_users", rating_usersRoutes);
        this.app.use("/piuts/api/users_talks", users_talksRoutes);
        this.app.use("/piuts/api/payment_settings", payment_settingsRoutes);
        this.app.use("/piuts/api/wallet_amount_user", wallet_amount_userRoutes);
        this.app.use("/piuts/api/wallet_user_transactions", wallet_user_transactionsRoutes);
    }
    /*
     * Inicia el listener del server
     * @param callback 
     */
    public listen(callback: (port: number) => void): void {
        let port = parseInt(process.env.PORT as any);
        this.httpServer.listen(port, () => {
            callback(port);
            this.initialize();
        });
    }
}
