import { Client } from "../client";
import { LoggerOptions } from "../interface";
import chalk from "chalk";

export class Logger {
    public client: Client;
    public options: LoggerOptions;

    public constructor(client: Client, options: LoggerOptions) {
        this.client = client;
        this.options = options;
    }

    private applyMessageElements(): string
    {
        var elements = [];
        if(this.options.show.envirovment) {
            elements.push(`[${this.client.options.envirovment.toUpperCase()}]`);
        }
        if(this.options.show.username) {
            if(this.client.profile?.userName) {
                elements.push(`[${this.client.profile.userName}]`);
            } else {
                elements.push(`[${this.client.guid}]`);
            }
        }
        if(this.options.show.time) {
            elements.push(`[${(new Date()).toLocaleTimeString()}]`);
        }
        return elements.join(' ');
    }

    public info(message: string) {
        console.log(`${chalk.white(`${this.applyMessageElements()} INFO » `)} ${message}`);
    }

    public notice(message: string) {
        console.log(`${chalk.blueBright(`${this.applyMessageElements()} NOTICE » `)} ${message}`);
    }

    public success(message: string) {
        console.log(`${chalk.greenBright(`${this.applyMessageElements()} SUCCESS » `)} ${message}`);
    }

    public warning(message: string) {
        console.log(`${chalk.yellow(`${this.applyMessageElements()} WARNING » `)} ${message}`);
    }

    public error(message: string) {
        console.log(`${chalk.red(`${this.applyMessageElements()} ERROR » `)} ${message}`);
    }
}