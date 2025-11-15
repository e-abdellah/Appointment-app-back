const { join } = require("path");
const config = require("config");
const knex = require("knex");

const { getLogger } = require("../core/logging");

const NODE_ENV = config.get("env");
const isDevelopment = NODE_ENV === "development";

const DATABASE_CLIENT = isDevelopment ? "mysql2" : "pg"; // Use MySQL locally, PostgreSQL in production
const DATABASE_NAME = config.get("database.name");
const DATABASE_HOST = config.get("database.host");
const DATABASE_PORT = config.get("database.port");
const DATABASE_USERNAME = config.get("database.username");
const DATABASE_PASSWORD = config.get("database.password");

let knexInstance;

async function initializeData() {
  const logger = getLogger();
  logger.info("Initializing connection to the database");

  const knexOptions = {
    client: DATABASE_CLIENT,
    connection: {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      ...(isDevelopment && DATABASE_CLIENT === "mysql2"
        ? {}
        : { database: DATABASE_NAME }), // Don't specify database initially for MySQL
      user: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      ...(DATABASE_CLIENT === "pg" && { ssl: { rejectUnauthorized: false } }), // Add SSL for PostgreSQL
    },
    debug: isDevelopment,
    migrations: {
      tableName: "knex_meta",
      directory: join("src", "data", "migrations"),
    },
    seeds: {
      directory: join("src", "data", "seeds"),
    },
  };

  knexInstance = knex(knexOptions);

  try {
    await knexInstance.raw("SELECT 1+1 AS result"); // Test database connection

    // Only create the database if running locally with MySQL
    if (isDevelopment && DATABASE_CLIENT === "mysql2") {
      await knexInstance.raw(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    }

    // Reinitialize with the correct database for MySQL after creation
    if (isDevelopment && DATABASE_CLIENT === "mysql2") {
      await knexInstance.destroy();
      knexOptions.connection.database = DATABASE_NAME;
      knexInstance = knex(knexOptions);
      await knexInstance.raw("SELECT 1+1 AS result"); // Test connection again
    }
  } catch (error) {
    logger.error("Error initializing the database connection", { error });
    throw new Error("Could not initialize the data layer");
  }

  // Run migrations only in development (production DB should already be migrated)
  if (isDevelopment) {
    try {
      await knexInstance.migrate.latest();
    } catch (error) {
      logger.error("Error while migrating the database", { error });
      throw new Error("Migrations failed, check the logs");
    }

    // Seed data in development
    try {
      await knexInstance.seed.run();
    } catch (error) {
      logger.error("Error while seeding database", { error });
    }
  }

  logger.info("Successfully connected to the database");

  return knexInstance;
}

function getKnex() {
  if (!knexInstance)
    throw new Error(
      "Please initialize the data layer before getting the Knex instance"
    );
  return knexInstance;
}

async function shutdownData() {
  getLogger().info("Shutting down database connection");
  await knexInstance.destroy();
  knexInstance = null;
  getLogger().info("Database connection closed");
}

const tables = Object.freeze({
  appointment: "appointment",
  doctor: "doctor",
  patient: "patient",
  user: "user",
});

module.exports = {
  tables,
  getKnex,
  initializeData,
  shutdownData,
};
