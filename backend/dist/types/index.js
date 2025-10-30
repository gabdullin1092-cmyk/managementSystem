"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_USER_STATUSES = exports.USER_STATUS_LABELS = exports.CompanyStatus = exports.UserStatus = void 0;
// Возможные статусы пользователя
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["ACTIVE"] = 10] = "ACTIVE";
    UserStatus[UserStatus["INACTIVE"] = 20] = "INACTIVE";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Возможные статусы компании
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus[CompanyStatus["ACTIVE"] = 10] = "ACTIVE";
    CompanyStatus[CompanyStatus["INACTIVE"] = 20] = "INACTIVE";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
// Константы
exports.USER_STATUS_LABELS = {
    [UserStatus.ACTIVE]: 'Активный',
    [UserStatus.INACTIVE]: 'Неактивный'
};
exports.VALID_USER_STATUSES = [UserStatus.ACTIVE, UserStatus.INACTIVE];
//# sourceMappingURL=index.js.map