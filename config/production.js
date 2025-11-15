module.exports = {
  log: {
    level: "info", // Use "info" or a less verbose level for production
    disabled: false,
  },
  cors: {
    origins: [
      "https://appointment-app-web-2023-24.onrender.com",
      process.env.FRONTEND_URL || "http://localhost:5173",
    ],
    maxAge: 3 * 60 * 60, // 3 hours
    credentials: true, // Allow cookies/auth headers
  },
  database: {
    client: "pg", // PostgreSQL
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT || 5432,
    name: process.env.DATABASE_NAME || "AppointmentApp",
    username: process.env.DATABASE_USERNAME || "root",
    password: process.env.DATABASE_PASSWORD || "",
  },
  auth: {
    argon: {
      saltLength: 16,
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
    jwt: {
      secret:
        "eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked",
      expirationInterval: 3 * 60 * 60 * 1000, // 3 hours
      issuer: "appointment.hogent.be",
      audience: "appointment.hogent.be",
    },
  },
  port: process.env.PORT || 8080, // Add this for the production server
};
