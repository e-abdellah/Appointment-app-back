const Router = require("@koa/router");

const installAppointmentRouter = require("./appointment");
const installHealthRouter = require("./health");
const installPatientRouter = require("./patient");
const installDoctorRouter = require("./doctor");

const rootHandler = async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    status: "ok",
    message: "Appointment API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/api",
  });

  installAppointmentRouter(router);
  installHealthRouter(router);
  installPatientRouter(router);
  installDoctorRouter(router);

  app.use(router.routes()).use(router.allowedMethods());

  // Root route handler
  const rootRouter = new Router();
  rootRouter.get("/", rootHandler);
  app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
};
