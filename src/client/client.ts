import axios from 'axios';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { ENV } from '../constant';
import { KeydropGiveaway, Profile } from '../entity';
import { ClientOptions, DiscordInteraction, DiscordProfile, ServiceBaseUrl } from '../interface';
import { Logger } from '../logger';
import { KeydropService, DiscordService } from '../service';

export class Client {
    public guid: string;
    public baseUrl: ServiceBaseUrl;
    public options: ClientOptions;
    public profile: Profile;
    public discordProfile: DiscordProfile;
    public logger: Logger;
    public currentTick: number;
    public goldenCodeCache: Array<string>;
    public giveawayCache: Array<number>
    public totalEarned: number;
    public userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.70';

    public constructor(options?: ClientOptions) {
        this.validateOptions(options);
        this.logger = new Logger(this, this.options.logger);
        this.baseUrl = {
            keydrop: '',
            discord: ''
        };
        this.goldenCodeCache = [];
        this.giveawayCache = [];
        this.currentTick = 0;
        this.totalEarned = 0;
        this.guid = randomUUID();
    }

    public validateOptions(options?: ClientOptions) {
        if(!options) options = {
            token: '',
            discordToken: '',
            discordChannel: '',
            giveaway: {
                discord: false,
                keydrop: true
            },
            region: 'en',
            envirovment: 'development',
            tickrate: {
                base: 20,
                verify: 20 * 10,
                updateProfile: 20 * 30,
                giveawayVerify: (20 * 60) * 3
            }
        };
        options = Object.assign(options, {
           envirovment: options?.envirovment ?? 'development',
           giveaway: {
            discord: options?.giveaway?.discord ?? false,
            keydrop: options?.giveaway?.keydrop ?? true
           },
           logger: {
               show: {
                   envirovment: options?.logger.show?.envirovment ?? true,
                   time: options?.logger.show?.time ?? false,
                   username: options?.logger.show?.username ?? false
               }
           },
           tickrate: {
               base: options?.tickrate?.base ?? 20,
               verify: options?.tickrate?.verify ?? 20 * 10,
               updateProfile: options?.tickrate?.updateProfile ?? 20 * 30,
               giveawayVerify: options?.tickrate?.giveawayVerify ?? (20 * 60) * 3
           }
        }) as ClientOptions;
        if(!Object.values(ENV).includes(options.envirovment)) {
            throw new Error(`Invalid envirovment type '${options.envirovment}' don't exists, valid types [${Object.values(ENV)}]`);
        }
        if(options.discordToken) {
            var pieces = options.discordToken.split('.');
            this.discordProfile = {
                user_id: atob(pieces[0])
            } as DiscordProfile;
        }
        this.options = options;
    }

    private async load() {
        axios.defaults.headers.common['User-Agent'] = this.userAgent;
        axios.defaults.headers.post['User-Agent'] = this.userAgent;
        axios.defaults.headers.get['User-Agent'] = this.userAgent;
        this.baseUrl.keydrop = await this.joinUrl('https://key-drop.com/', `${this.options.region}`);
        this.baseUrl.discord = await this.joinUrl('https://discord.com/api/v9/');
        await this.updateProfile();
    }


    public async joinUrl(...args: any) {
        return await args
        .join('/')
        .replace(/[\/]+/g, '/')
        .replace(/^(.+):\//, '$1://')
        .replace(/^file:/, 'file:/')
        .replace(/\/(\?|&|#[^!])/g, '$1')
        .replace(/\?/g, '&')
        .replace('&', '?');;
    }

    public async buildUrl(path: string, type?: 'keydrop' | 'discord' | undefined) {
        if(!type) type = 'keydrop';
        return await this.joinUrl(this.baseUrl[type], path);
    }
    
    public async initialize() {
        await this.load();
        this.run();
        this.logger.info('Keydrop Client Initialized.');
        this.logger.info(`Pointing to: ${this.baseUrl.keydrop} region.`);
        if(this.profile) {
            this.logger.info(`Welcome back, ${chalk.green(this.profile.userName)}! Your balance is ${this.profile.balance}${this.profile.currency}.`);
            this.logger.info(`You have ${chalk.yellow(this.profile.gold)} gold, waiting per more golden codes to use...`);
        } else {
            this.logger.warning('Failed to update user profile.');
        }
    }

    private delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    public async run() {
        while(true) {
            await this.delay(1000 / this.options.tickrate.base);
            this.currentTick++;
            if(this.currentTick % this.options.tickrate.verify == 0) {
                this.logger.info('Verifying golden codes...');
                DiscordService.getLastCodes(this, 5)
                .then(async response => {
                    for(var item of response.reverse()) {
                        const goldenCode = item?.embeds[0]?.author?.name ?? '';
                        const goldenTime = new Date(item?.timestamp ?? '2022-05-31T21:08:29.263000+00:00');
                        const timeDiff = Math.floor(((Math.abs((new Date()).valueOf() - goldenTime.valueOf()))/1000)/60);
                        if(goldenCode.length == 17 && !this.goldenCodeCache.includes(goldenCode) && timeDiff < 60 * 3) {
                            this.logger.notice(`New golden code encountered! Code: ${chalk.yellowBright(goldenCode)}.`);
                            this.goldenCodeCache.push(goldenCode);
                            KeydropService.usePromocode(this, goldenCode)
                            .then(response => {
                                if(response?.status) {
                                    const earned = response.bonus ?? response.goldBonus;
                                    this.totalEarned += parseInt(earned);
                                    this.logger.success(`You received ${chalk.yellowBright(earned)} gold for using the code ${chalk.yellowBright(response.promoCode)}.`);
                                } else {
                                    if(response.promoCode && response.info) {
                                        this.logger.error(`Can't use code ${chalk.redBright(response.promoCode)} because, ${chalk.redBright(response.info)}.`);
                                    } else {
                                        this.logger.error(`Can't use code ${chalk.redBright(goldenCode)} because, ${chalk.redBright('has expired or is invalid')}.`);
                                    }
                                }
                            })
                            .catch(error => this.logger.error(error));
                            const timeToUseAgain = 1000 * 10;
                            await this.delay(timeToUseAgain)
                            this.currentTick += this.options.tickrate.base * 10;
                        }
                    }
                })
                .catch(error => this.logger.error(error));
            }

            if(this.currentTick % this.options.tickrate.updateProfile == 0) {
                this.logger.info('Updating profile...')
                await this.updateProfile();
                if(this.profile) {
                    this.logger.notice(`Profile updated! Actual balance is ${chalk.whiteBright(this.profile.balance)}${this.profile.currency} and ${chalk.yellowBright(this.profile.gold)} gold.`);
                    this.logger.notice(`You have earned an total of ${chalk.yellowBright(this.totalEarned)} gold.`);
                } else {
                    this.logger.warning('Failed to update user profile.');
                }
            }

            if(this.currentTick % this.options.tickrate.giveawayVerify == 0) {
                this.logger.info('Verifying giveaways available...');
                if(this.options.giveaway.discord && this.options.discordGiveawayChannel) {
                    for(var channel of this.options.discordGiveawayChannel) {
                        DiscordService.getLastGiveaway(this, channel)
                        .then(response => {
                            for(var item of response.reverse()) {
                                if(item?.components && item?.components?.length == 1) {
                                    // var component = item?.components[0]?.components[0];
                                    // if(component) {
                                    //     console.log(item);
                                    //     var interaction = {
                                    //         application_id: item.author.id,
                                    //         channel_id: item.channel_id,
                                    //         message_id: item.id,
                                    //         message_flags: 0,
                                    //         nonce: this.discordProfile.user_id,
                                    //         type: 3
                                    //     } as DiscordInteraction;
                                    //     console.log(interaction);
                                    // }
                                    this.logger.warning(`Discord | Can't enter in the giveaway because the method is not implemented for this type.`);
                                } else if(item?.reactions) {
                                    const embed = item.embeds[0];
                                    const weaponGiveaway = embed.author.name;
                                    const finishAt = new Date(parseInt(`${embed.description.split("\n")[1].split(" ")[1].split(/[^0-9]/).join('')}000`));
                                    const reaction = item.reactions[0];
                                    if(reaction && !reaction.me) {
                                        DiscordService.enterGiveaway(this, channel, item.id, reaction.emoji.name)
                                        .then(() => {
                                            this.logger.success(`Discord | You have entered in '${chalk.cyan(weaponGiveaway)}' giveaway! Finish at: ${chalk.cyan(finishAt.toLocaleString())}.`);
                                        })
                                        .catch(err => this.logger.error(err));
                                    }
                                }   
                            }
                        })
                        .catch(error => this.logger.error(error));
                        const timeToUseAgain = 1000;
                        await this.delay(timeToUseAgain)
                        this.currentTick += this.options.tickrate.base;
                    }
                }
                if(this.options.giveaway.keydrop) {
                    KeydropService.getGiveaways(this)
                    .then(async response => {
                        for(var giveaway of (response as KeydropGiveaway[])) {
                            if(this.giveawayCache.includes(giveaway.id)) return;
                            KeydropService.enterGiveaway(this, giveaway.id)
                            .then(res => {
                                if(res.Status == 1) {
                                    this.logger.success(`You have entered in '${chalk.cyan(giveaway.title)}' giveaway! Finish at: ${chalk.cyan(new Date(parseInt(`${giveaway.leftTime}000`)).toLocaleString())}.`);
                                } else {
                                    this.logger.error(`Can't enter in '${chalk.cyan(giveaway.title)}' giveaway because, ${chalk.redBright(res.Info)}.`);
                                }
                            })
                            .catch(error => {
                                this.logger.error("Can't enter in keydrop giveaway because received error from api");
                                this.logger.error(error);
                            });
                            this.giveawayCache.push(giveaway.id);
                            const timeToUseAgain = 1000 * 5;
                            await this.delay(timeToUseAgain)
                            this.currentTick += this.options.tickrate.base * 5;
                        }
                    })
                    .catch(error => {
                        this.logger.error("Can't get keydrop giveaways because received error from api");
                        this.logger.error(error);
                    });
                }
            }
        }
    }

    public async updateProfile() {
        await KeydropService.getUserProfile(this)
        .then(response => {
            this.profile = response as Profile;
        })
        .catch(error => this.logger.error(error));
    }

    public getProfile() {
        return this.profile;
    }

    public getLogger(): Logger {
        return this.logger;
    }
}