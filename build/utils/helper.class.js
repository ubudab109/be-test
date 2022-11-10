"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Helper {
    /**
     * It hashes the password.
     *
     * @param {string} password - The password to be hashed
     * @returns {string} A hashed password.
     */
    hashPassword(password) {
        const hashed = bcryptjs_1.default.hashSync(password, 8);
        return hashed;
    }
    /**
     * A function that compares the encrypted password with the new password.
     * @param {string} encryptedOldPassword
     * @param {string} newPassword
     * @returns {Promise<boolean>}
     */
    isOldPasswordValid = async (encryptedOldPassword, newPassword) => {
        const isValidPassword = await bcryptjs_1.default.compare(newPassword, encryptedOldPassword);
        return isValidPassword;
    };
    /**
     * It generates a random string of 35 characters from the characters string
     * This random string is used for verification token email
     *
     * @returns {string} A string of 35 random characters.
     */
    generateVerificationEmailToken() {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let token = '';
        for (let i = 0; i < 35; i++) {
            token += characters[Math.floor(Math.random() * characters.length)];
        }
        return token;
    }
    /**
     * It takes a date and adds a number of days to it
     * @param {Date} date - Date - The date to add days to
     * @param {number} days - number - The number of days to add to the date.
     * @returns {Date} The date object is being returned.
     */
    addDaysFromDate(date, days) {
        date.setDate(date.getDate() + days);
        return date;
    }
    /**
     * Add days from current date to spesific days.
     *
     * @param {number} days - number - The number of days to add to the date.
     * @returns {Date} The date object is being returned.
     */
    addDays(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }
    /**
     * Substract days from current date to spesific days.
     *
     * @param {number} days - number - The number of days to add to the date.
     * @returns {Date} The date object is being returned.
     */
    substractDays(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }
    /**
     * If the input matches the regular expression, return true, otherwise return false.
     * Checking for validating email
     * @param {string} input - string - The string to validate
     * @returns {boolean}.
     */
    validateEmail(input) {
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (input.match(validRegex)) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * It returns a new date object that is 7 days before the current date.
     *
     * @returns A date object that is 7 days ago.
     */
    getLastWeeksDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }
    /**
     * It takes a date object and returns a string in the format of YYYY-MM-DD HH:MM:SS.
     * @param {Date} date - Date - The date to format
     * @returns A string in the format of YYYY-MM-DD HH:MM:SS
     */
    formatDate(date) {
        return ([
            date.getFullYear(),
            this.padTo2Digits(date.getMonth() + 1),
            this.padTo2Digits(date.getDate()),
        ].join('-') +
            ' ' +
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
                this.padTo2Digits(date.getSeconds()),
            ].join(':'));
    }
    /**
     * If the number is less than 10, add a 0 to the front of it.
     * @param {number} num - The number to be formatted.
     * @returns a string.
     */
    padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }
}
exports.Helper = Helper;
//# sourceMappingURL=helper.class.js.map