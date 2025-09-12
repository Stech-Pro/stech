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
exports.AwsService = void 0;
const common_1 = require("@nestjs/common");
const client_ssm_1 = require("@aws-sdk/client-ssm");
let AwsService = class AwsService {
    ssmClient;
    constructor() {
        this.ssmClient = new client_ssm_1.SSMClient({
            region: process.env.AWS_REGION || 'ap-northeast-2',
        });
    }
    async getParameter(name, withDecryption = true) {
        try {
            const command = new client_ssm_1.GetParameterCommand({
                Name: name,
                WithDecryption: withDecryption,
            });
            const response = await this.ssmClient.send(command);
            return response.Parameter?.Value || '';
        }
        catch (error) {
            console.error(`Failed to get parameter ${name}:`, error);
            throw new Error(`Parameter ${name} not found`);
        }
    }
    async getMultipleParameters(names) {
        const results = {};
        for (const name of names) {
            try {
                results[name] = await this.getParameter(name);
            }
            catch (error) {
                console.error(`Failed to get parameter ${name}:`, error);
                results[name] = '';
            }
        }
        return results;
    }
};
exports.AwsService = AwsService;
exports.AwsService = AwsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AwsService);
//# sourceMappingURL=aws.service.js.map