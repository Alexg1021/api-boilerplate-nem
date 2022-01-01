import BaseController from "./base.controller";
import authService from "../services/auth.service";
import User from "../models/user";
import { InvalidInputError } from "../types/error";

class AuthController extends BaseController {
  constructor(router) {
    super(User, "user");
    router.route("/auth/login").post(this.login);
    // router.route("/auth/logout").post(this.logout);
  }

  login = async (req, res, next) => {
    try {
      // lowercase the email
      req.body.email = req.body.email.toLowerCase();

      //   hit the database to see if the user exists
      let user = await User.findOne({
        email: req.body.email,
      }).select("+password");

      if (!user)
        return res.status(401).send({
          message:
            "This user does not exist, please check your email and try again",
        });

      //   Compare the hashed password with the password from req.body
      let isMatch = await user.comparePassword(
        req.body.password,
        user.password
      );
      if (!isMatch)
        return res.status(401).send({
          message: "The password is incorrect. Please try again.",
        });

      // Generate random hash as part of the user's secret access token then save to db
      user.userTokenHash = user.generateRandomHash();
      await user.save();

      // create token, parse the user, and form object to return to client
      let _user = await authService.tokenizeUserObject(user);

      res.status(201).json({ user: _user });
    } catch (e) {
      next(new InvalidInputError(e.message, e));
    }
  };
}

export default AuthController;
