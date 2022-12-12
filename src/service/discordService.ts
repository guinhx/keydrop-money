import axios from 'axios';
import { Client } from '../client';
import { DiscordInteraction } from '../interface';

export namespace DiscordService {
    export function getLastCodes(client: Client, limit?: number): Promise<any> {
        limit = limit ? limit : 5;
        return new Promise(async (resolve, reject) => {
            axios.get(await client.buildUrl(`/channels/${client.options.discordChannel}/messages?limit=${limit}`, 'discord'), {
                withCredentials: true,
                headers: {
                    Authorization: client.options.discordToken
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        });
    }

    export function getLastGiveaway(client: Client, channel: string|number, limit?: number): Promise<any> {
        limit = limit ? limit : 3;
        return new Promise(async (resolve, reject) => {
            axios.get(await client.buildUrl(`/channels/${channel}/messages?limit=${limit}`, 'discord'), {
                withCredentials: true,
                headers: {
                    Authorization: client.options.discordToken
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        })
    }

    export function makeInteraction(client: Client, channel: string|number, interaction: DiscordInteraction) {
        // https://discord.com/api/v9/interactions
        return new Promise(async (resolve, reject) => {
            axios.put(await client.buildUrl(`/interactions`, 'discord'), interaction, {
                withCredentials: true,
                headers: {
                    Authorization: client.options.discordToken
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        })
    }

    export function enterGiveaway(client: Client, channel: string|number, message: string|number, reaction: string): Promise<any> {
        reaction = encodeURI(reaction);
        const target = `${encodeURIComponent('@')}me`
        return new Promise(async (resolve, reject) => {
            axios.put(await client.buildUrl(`/channels/${channel}/messages/${message}/reactions/${reaction}/${target}`, 'discord'), {
                'location': 'Message'
            }, {
                withCredentials: true,
                headers: {
                    Authorization: client.options.discordToken
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        })
    }
}