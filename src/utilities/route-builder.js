import * as fs from "fs";
import { Router } from "express";

const router = Router(),
  controllers = fs.readdirSync(`${__dirname}/../controllers`);

const routeBuilder = (app) => {
  controllers.forEach((controller) => {
    let ApiController;

    ApiController = require(`../controllers/${controller.replace(/.js/, "")}`)
      .default;

    if (ApiController) new ApiController(router);
  });

  app.use("/api/v1", router);
};

export default routeBuilder;
