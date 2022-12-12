import { Client } from "./client";
import { config } from 'dotenv';
import { ENV } from './constant';
import { Envirovment } from './data';

// Use local .env file
if (Envirovment.getEnvirovment() !== ENV.PRODUCTION) {
    config();
}

const getCookiesFromRaw = async (token: string) => {
    const rawCookies = token.split(' ');
    const cookies = [];
    for(var raw of rawCookies) {
        var data = raw.replace(';', '').split('=');
        cookies[data[0]] = data[1];
    }
    return cookies;
}

const getRegion = function (token: string) {
    return (getCookiesFromRaw(token)['key-lang'] ?? 'pt').toLowerCase();
}

const main = async () => {
    // u can add more than one account at same time.
    var accounts = [
        {
            token: '<keydrop_token>',
            giveaway: { discord: true } // join in discord giveaways.
        },
        {
            token: '<keydrop_token>',
            giveaway: { discord: false } // join in discord giveaways.
        }
    ];
    for(var account of accounts) {
        var client = new Client({
            envirovment: Envirovment.getEnvirovment(),
            region: getRegion(account.token),
            token: account.token,
            discordToken: Envirovment.getDiscordToken(),
            discordChannel: Envirovment.getDiscordChannel(),
            discordGiveawayChannel: Envirovment.getDiscordGiveawayChannel(),
            giveaway: account.giveaway,
            logger: {
                show: {
                    time: true,
                    username: true
                }
            },
            tickrate: {
                verify: (20 * 60) * 5,
                updateProfile: (20 * 60) * 18,
                giveawayVerify: (20 * 60) * 1
            }
        });
        client.logger.info('Starting client ' + accounts.indexOf(account));
        await client.initialize();
    }
}

main();