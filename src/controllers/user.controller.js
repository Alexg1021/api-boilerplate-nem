import User from "../models/user";
import BaseController from "./base.controller";
import emailService from "../services/email/email-service";
import authService from "../services/auth.service";
import { InvalidInputError, ResourceExistsError } from "../types/error";

class UserController extends BaseController {
  constructor(router) {
    super(User, "user");
    router.route("/users").get(this.getAll).post(this.createUser);
    router
      .route("/users/:id")
      .get(this.findOne)
      .put(this.update)
      .delete(this.softDelete);
    router.route("/users/send-test").post(this.testEmail);
  }

  createUser = async (req, res, next) => {
    let user = req.body;
    try {
      user.email = user.email.toLowerCase();

      // Hash the user's password
      let hash = await User.hashPassword(user.password);
      user.password = hash;

      // Create the user model and save to db
      let newUser = new User(user);
      newUser.userTokenHash = newUser.generateRandomHash();
      await newUser.save();

      // Send email to user with successful response
      // using gutierrez.lx@gmail.com as a placeholder until moving aws ses out of sandbox
      await emailService(
        "gutierrez.lx@gmail.com",
        "Quark_Welcome_Template",
        `{
        \"email\":\"${newUser.email}\",
        \"name\":\"${newUser.firstName} ${newUser.lastName}\",
        \"applicationName\": \"${process.env.APPLICATION_NAME}\",
        \"homeUrl\": \"${process.env.APPLICATION_URL}\"
      }`
      );

      // create token, parse mongoose document, and form user object to return to client
      let _user = await authService.tokenizeUserObject(newUser);

      return res.status(200).send(_user);
    } catch (e) {
      if (e.message.includes("duplicate key error")) {
        return next(
          new ResourceExistsError("A user with this email already exists", e)
        );
      }
      return next(new InvalidInputError(e.message, e));
    }
  };

  testEmail = async (req, res, next) => {
    try {
      const sent = await emailService(
        "gutierrez.lx@gmail.com",
        "Quark_Welcome_Template",
        `{
        \"email\":\"gutierrez.lx@gmail.com\",
        \"name\":\"Alex Gutierrez\",
        \"applicationName\": \"${process.env.APPLICATION_NAME}\",
        \"homeUrl\": \"${process.env.APPLICATION_URL}\"
      }`
      );
      return res.status(200).send({ message: "Successfuly sent email!" });
    } catch (e) {
      return next(new InvalidInputError(e.message, e));
    }
  };
}

export default UserController;
