"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSession_1 = require("./UserSession");
const register_type_enum_1 = require("../utils/register_type.enum");
const UserVerification_1 = require("./UserVerification");
let User = class User {
    id;
    session;
    verification;
    email;
    fullname;
    password;
    registerType;
    isEmailVerified;
    timesLoggedIn;
    created_at;
    checkIfUnencryptedPasswordIsValid(unecrypted) {
        return bcryptjs_1.default.compareSync(unecrypted, this.password);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserSession_1.UserSession, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => UserVerification_1.UserVerification, (verification) => verification.user),
    __metadata("design:type", UserVerification_1.UserVerification)
], User.prototype, "verification", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "fullname", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: register_type_enum_1.RegisterType,
        default: null,
    }),
    __metadata("design:type", String)
], User.prototype, "registerType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: 0,
    }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
    }),
    __metadata("design:type", Number)
], User.prototype, "timesLoggedIn", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
User = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map