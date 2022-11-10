"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_routes_1 = require("./routes/api.routes");
const express_validator_1 = require("express-validator");
class App {
    app;
    constructor() {
        this.app = (0, express_1.default)();
        this.configuration();
        this.routes();
    }
    /**
     * THIS FUNCTION IS TO CONFIGURE THE PORT IN APP
     * IF PORT NOT SET IN .env THEN THIS APP WILL USE DEFAULT PORT 3030
     */
    configuration = () => {
        this.app.set('port', process.env.PORT);
    };
    /**
     * THIS FUNCTION IS TO CONFIGURE THE ROUTES
     */
    routes = async () => {
        this.app.use((0, cors_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use(body_parser_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.get('/', (req, res) => {
            res.send('Backend Test');
        });
        api_routes_1.ApiRoutes.forEach(route => {
            this.app[route.method](route.route, !route.middleware ? [] : route.middleware, ...route.validation, async (req, res, next) => {
                try {
                    const errors = (0, express_validator_1.validationResult)(req);
                    if (!errors.isEmpty()) {
                        let responseData = {
                            status: 400,
                            message: errors.array(),
                            data: null,
                        };
                        res.status(422).json(responseData);
                    }
                    else {
                        await (new route.controller)[route.action](req, res, next);
                    }
                }
                catch (err) {
                    next(err);
                }
            });
        });
    };
    /**
     * FUNCTION TO START APPLICATION
     */
    start = () => {
        this.app.listen(this.app.get('port'), () => {
            console.log(__dirname + '/entity/*.js');
            console.log(`Server is listening ${this.app.get('port')} port`);
        });
    };
}
exports.App = App;
//# sourceMappingURL=app.js.map