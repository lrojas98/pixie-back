import { Sequelize } from "sequelize";

export class Connection {
    private static instance: Connection;
    public db?: Sequelize;

    constructor() { }

    /**
     * Obtiene la instancia de la clase
     */
    public static getInstance(): Connection {
        if (!Connection.instance) {
            Connection.instance = new Connection();

            Connection.instance.db = new Sequelize(process.env.DB as string, process.env.USER_DB as string, process.env.PASS_DB, {
                host: 'localhost',
                dialect: 'mysql',
                define: {
                    timestamps: false,
                },
                logging: false
            })
        }

        return Connection.instance;
    }
}