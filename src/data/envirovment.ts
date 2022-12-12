export namespace Envirovment {
    export function getEnvirovment(): string {
        return process.env.NODE_ENV;
    }

    export function getRegion(): string {
        return process.env.KEYDROP_REGION;
    }

    export function getToken(): string {
        return process.env.KEYDROP_TOKEN;
    }

    export function getDiscordToken(): string {
        return process.env.DISCORD_TOKEN;
    }
    export function getDiscordChannel(): string {
        return process.env.DISCORD_CHANNEL;
    }

    export function getDiscordGiveawayChannel(): string[] {
        return process.env.DISCORD_GIVEAWAY_CHANNEL.split(',');
    }
}