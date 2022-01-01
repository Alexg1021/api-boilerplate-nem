import * as _ from "lodash";

export default class BaseController {
  model;
  key;
  populate;
  select;
  sort;

  constructor(model, key) {
    this.model = model;
    this.key = key;
  }

  getAll = async (req, res, next) => {
    try {
      let data = await this.model.find({ deletedAt: null });
      return res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  };

  create = async (req, res, next) => {
    try {
      const doc = new this.model(req.body);
      const data = await doc.save();

      return res.status(200).send(data);
    } catch (e) {
      next(e);
    }
  };

  findOne = async (req, res, next) => {
    try {
      const data = await this.model.findOne({ _id: req.params.id });
      return res.status(200).send(data);
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.model.findOne({ _id: req.params.id });

      if (this.key === "user" && !!req.body.password) delete req.body.password;

      const merged = Object.assign(data, req.body);
      const updated = await merged.save();

      return res.status(200).send(updated);
    } catch (e) {
      return next(e);
    }
  };

  softDelete = async (req, res, next) => {
    try {
      const data = await this.model.findOne({ _id: req.params.id });
      await data.updateOne({ deletedAt: new Date() });
      return res.status(200).send({
        message: `The User with _id of ${req.params.id} has been safely removed!`,
      });
    } catch (e) {
      return next(e);
    }
  };
}
