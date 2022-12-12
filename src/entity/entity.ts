export interface Profile {
    userName: string,
    tradeURL: string,
    avatar: string,
    lang: string,
    currency: string,
    balance: number,
    gold: number,
    eventCoint: number,
    eventIsActive: boolean,
    supportNotifications: number,
    newletter: true
}

export interface KeydropGiveaway {
    id: number,
    type: number,
    title: string,
    leftTime: number
}