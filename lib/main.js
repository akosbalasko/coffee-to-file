"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessageLine = exports.saveBMAC2File = exports.run = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const buymeacoffee_js_1 = __importDefault(require("buymeacoffee.js"));
const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->';
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fileName = core.getInput('FILENAME');
            core.debug('started, getting buyme token...');
            const coffeeToken = core.getInput('BUY_ME_A_COFFEE_TOKEN');
            const coffee = new buymeacoffee_js_1.default(coffeeToken);
            core.debug('coffeeAPI connection established.');
            const supporters = yield coffee.Supporters();
            const decodedReadme = fs.readFileSync(fileName, 'utf-8');
            const numberOfMessages = Number(core.getInput('NUMBER_OF_MESSAGES'));
            const messages = supporters.data
                .slice(0, numberOfMessages)
                .map((supporter) => (0, exports.generateMessageLine)(supporter))
                .join('\n');
            const updatedReadme = (0, exports.saveBMAC2File)(decodedReadme, messages);
            fs.writeFileSync(fileName, updatedReadme);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
exports.run = run;
const saveBMAC2File = (readme, messages) => {
    const str = `${PLACEHOLDER_START}[\\s\\S]*${PLACEHOLDER_END}`;
    const updateRegexp = new RegExp(str, 'g');
    return readme.replace(updateRegexp, `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`);
};
exports.saveBMAC2File = saveBMAC2File;
const generateMessageLine = (supporter) => {
    let coffees = '<div>';
    for (let i = 0; i < supporter.support_coffees; ++i) {
        coffees += '<img src="https://github.com/akosbalasko/coffee-to-file/blob/main/assets/bmc-logo.png?raw=true" width="30">';
    }
    coffees += ` from <b>${supporter.payer_name}</b> </div>`;
    return `${coffees}  <div><i>${supporter.support_note}</i></div><br>`;
};
exports.generateMessageLine = generateMessageLine;
run();
