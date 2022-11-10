"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const GoogleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.default = GoogleClient;
//# sourceMappingURL=google.config.js.map