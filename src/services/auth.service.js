import * as jwt from "jsonwebtoken";
import User from "../models/user";
import { InvalidInputError, UnauthenticatedError } from "../types/error";

const secret = process.env.TOKEN_SECRET;

const unprotectedRoutes = [
  { path: "/api/v1/auth/login", method: "POST" },
  { path: "/api/v1/auth/logout", method: "GET" },
  { path: "/api/v1/users/reset-password", method: "PUT,POST" },
  { path: "/api/v1/health-check", method: "GET" },
];

const sign = (payload, hash, options) => {
  try {
    const tokenSecret = secret + hash;
    return jwt.sign(payload, tokenSecret, options);
  } catch (e) {
    throw e;
  }
};

const verify = (token, hash) => {
  try {
    return jwt.verify(token, `${secret}${hash}`);
  } catch (e) {
    throw e;
  }
};

const tokenizeUserObject = async (user) => {
  try {
    // Create a token with options
    const token = sign({ _id: user._id }, user.userTokenHash, {
      expiresIn: "14d",
    });

    //   null important data
    user.password = undefined;
    user.userTokenHash = undefined;
    user.passwordReset = undefined;

    //   parse the mongoose document and attach the token to the object
    let _user = JSON.parse(JSON.stringify(user));
    _user["token"] = token;

    return _user;
  } catch (e) {
    throw e;
  }
};

const protectRoutes = async (req, res, next) => {
  try {
    if (unprotectedRoutes.find((route) => req.path === route.path))
      return next();

    // check for auth token
    const token = checkToken(req);
    if (token === "No Token Available") return res.status(400).send({ message: token });

    // check to see if the token passes the jwt tests
    let { _id } = jwt.decode(token);
    let user = await User.findOne({ _id }).select("+userTokenHash");
    jwt.verify(token, `${secret}${user.userTokenHash}`);
    user.userTokenHash = undefined;

    req["current_user"] = user;

    return next();
  } catch (e) {
    next(new UnauthenticatedError(e.message, e));
  }
};

const checkToken = (req) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }
  catch(e) {
    return "No Token Available";
  }
}

export default { sign, verify, tokenizeUserObject, protectRoutes };
