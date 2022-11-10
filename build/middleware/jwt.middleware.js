"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = __importDefault(require("../config/jwt.config"));
class JWTMiddleware {
    /**
     * THIS FUNCTION IS TO CHECKING THE TOKEN FOR THE AUTHENTICATED REQUEST
     *
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns
     */
    checkJwt = (req, res, next) => {
        // GET JWT TOKEN FROM HEADER
        const token = req.headers.authorization;
        let jwtPayload;
        // VALIDATE TOKEN
        try {
            jwtPayload = jsonwebtoken_1.default.verify(token, jwt_config_1.default.jwtSecret);
            res.locals.jwtPayload = jwtPayload;
        }
        catch (err) {
            // IF TOKEN IS INVALID
            let responseData = {
                status: 401,
                message: 'Unauthorized',
            };
            res.status(401).send(responseData);
            return;
        }
        /**
         * TOKEN VALID FOR 1 HOUR
         * WE WANT SEND A NEW TOKEN ON EVERY REQUEST
         */
        const { userId, email } = jwtPayload;
        const newToken = jsonwebtoken_1.default.sign({ userId, email }, jwt_config_1.default.jwtSecret, {
            expiresIn: '24h',
        });
        res.setHeader('token', newToken);
        // CALL NEXT FUNCTION
        next();
    };
}
exports.JWTMiddleware = JWTMiddleware;
//# sourceMappingURL=jwt.middleware.js.map