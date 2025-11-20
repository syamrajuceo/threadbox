"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailAccountDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_email_account_dto_1 = require("./create-email-account.dto");
class UpdateEmailAccountDto extends (0, mapped_types_1.PartialType)(create_email_account_dto_1.CreateEmailAccountDto) {
}
exports.UpdateEmailAccountDto = UpdateEmailAccountDto;
//# sourceMappingURL=update-email-account.dto.js.map