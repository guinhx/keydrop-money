import axios from 'axios';
import { Client } from '../client';
import { KeydropGiveaway } from '../entity';
const cheerio = require('cheerio');
const hooman = require('hooman');

// Api/promocode_history 
// Giveaway/add (entrar em um giveaway)
// Free_money/odbierz (abrir caixa diaria)

export namespace KeydropService {
    export function getBalance(client: Client): Promise<any> {
        return new Promise(async (resolve, reject) => {
            axios.get(await client.buildUrl('/balance'), {
                withCredentials: true,
                headers: {
                    Cookie: client.options.token
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error))
        });
    }
    export function usePromocode(client: Client, promocode: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            axios.post(await client.buildUrl('/Api/activation_code'), JSON.stringify({
                promoCode: promocode,
                recaptcha: null
            }), {
                headers: {
                    'content-type': 'application/json',
                    'x-requested-with': 'XMLHttpRequest',
                    'Cookie': client.options.token
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        });
    }
    export function getUserProfile(client: Client): Promise<any> {
        return new Promise(async (resolve, reject) => {
            var options = {
                withCredentials: true,
                headers: {
                    Cookie: client.options.token
                }
            };
            await axios.get(await client.buildUrl('/apiData/Init/index'), options)
            .then(response => resolve(response))
            .catch(error => reject(error));
        });
    }
    export function getGiveaways(client: Client): Promise<any> {
        return new Promise(async (resolve, reject) => {
            axios.get(await client.buildUrl(''), {
                withCredentials: true,
                headers: {
                    Cookie: client.options.token
                }
            })
            .then(response => {
                // response.data
                const $ = cheerio.load(response.data);
                const result = [];
                $('.giveaway-m').each((index, element) => {
                    const giveaway = $(element)[0].attribs;
                    result.push({
                        id: giveaway['data-id'],
                        title: giveaway['data-title'],
                        leftTime: giveaway['data-left_time'],
                        type: giveaway['data-type']
                    } as KeydropGiveaway);
                })
                return resolve(result as KeydropGiveaway[]);
            })
            .catch(error => reject(error));
        });
    }
    export function enterGiveaway(client: Client, id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            axios.post(await client.buildUrl('/Giveaway/add'), `giveaway=${id}`, {
                withCredentials: true,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'x-requested-with': 'XMLHttpRequest',
                    Cookie: client.options.token
                }
            })
            .then(response => resolve(response.data))
            .catch(error => reject(error))
        });
    }
}