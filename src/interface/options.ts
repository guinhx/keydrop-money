export interface ClientOptions
{
    envirovment: string,
    region: string,
    token: string,
    discordToken: string,
    discordChannel: string,
    discordGiveawayChannel?: string[],
    giveaway?: GiveawayOptions,
    logger?: LoggerOptions,
    tickrate?: ClientTickrate
}

export interface ClientTickrate {
    base?: number,
    verify: number,
    updateProfile: number,
    giveawayVerify?: number
}

export interface ServiceBaseUrl {
    keydrop: string,
    discord: string
}

export interface GiveawayOptions{
    keydrop?: boolean,
    discord?: boolean
}

export interface LoggerOptions 
{
    show: LoggerShowOptions
}

export interface LoggerShowOptions 
{
    envirovment?: boolean,
    username?: boolean,
    time?: boolean
}