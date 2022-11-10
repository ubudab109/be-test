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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVerification = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const verification_type_enum_1 = require("../utils/verification_type.enum");
let UserVerification = class UserVerification {
    id;
    token;
    verificationType;
    expirationToken;
    isUsed;
    user;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], UserVerification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        unique: true,
    }),
    __metadata("design:type", String)
], UserVerification.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: verification_type_enum_1.VerificationType,
        default: null,
    }),
    __metadata("design:type", String)
], UserVerification.prototype, "verificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamptz',
        nullable: true,
    }),
    __metadata("design:type", Date)
], UserVerification.prototype, "expirationToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: 0,
    }),
    __metadata("design:type", Boolean)
], UserVerification.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.verification, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", User_1.User)
], UserVerification.prototype, "user", void 0);
UserVerification = __decorate([
    (0, typeorm_1.Entity)('user_verification')
], UserVerification);
exports.UserVerification = UserVerification;
//# sourceMappingURL=UserVerification.js.map