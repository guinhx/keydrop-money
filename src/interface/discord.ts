export interface DiscordInteraction {
    application_id: string,
    channel_id: string,
    data: DiscordInteractionComponent,
    guild_id: string,
    message_flags: number,
    message_id: string,
    nonce: string,
    session_id: string,
    type: number
}

export interface DiscordInteractionComponent {
    component_type: number,
    custom_id: string
}

export interface DiscordProfile {
    user_id: string
}