# Key-drop Money

Hi! This is a repository for anyone who wants a base to create bots for sites like this one. Until **August 2022** it was working for its purpose, but after the site implemented some countermeasures, it ended up breaking the current logic.
If you still want to use it, you should refactor a small part to use libraries like **puppeteer** and API to bypass the re-captcha (they are paid).
You can also set the re-captcha to open the browser with puppeteer when necessary, but this will not be 100% automated.

## Advantages of use
- Support for multiple accounts
- Can actively participate in a giveaway either on the website or Discord
- Clean and easy to understand code
- Great scalability given the structure of the code
- No need to open browser tabs to have multiple accounts
- Highly configurable by index.ts file code.

## Setting up the project.
To run the project on your machine, you must first clone it and then access the folder and run the command 

> npm install

Once this is done, you will also see that the project contains some files and among them the .env.example.

Make a copy and rename it to .env and then open it with a text editor or Visual Code, after opening it you must fill in some mandatory fields, namely:

 - **DISCORD_TOKEN** *(your Discord token, use the inspect element on the computer, send a message and in the Network tab look for the request and in the headers you will find your token)*
 - **DISCORD_CHANNEL** *(refers to the ID of the Discord channel from Team Aversen where the bot finds the codes of the day and if it prefers to use another one, then it will have to refactor a part of the code)*
  - **DISCORD_GIVEAWAY_CHANNEL** *(refers to a list of channel IDs in Discord keydrop)*

Unused fields, fields that after supporting multiple customers/accounts in the bot were rendered useless.

 - **KEYDROP_REGION** *(region where you usually use the keydrop)*
 - **KEYDROP_TOKEN** *(your keydrop token found also in site requests)*

After filling in all these fields you will have to access the index.ts file located in the src folder and in it add the accounts you want to use in the bot in an array like this one below:

``` typescript
var accounts = [
      {
          token: '<keydrop_token>',
          giveaway: { discord: true } // can join in discord giveaways.
      },
      {
          token: '<keydrop_token>',
          giveaway: { discord: false } // can join in discord giveaways.
      }
 ];
 ```
 To run execute the command line
 

> npm run dev

## The technologies used to create it were:

 - **Axios**
 - **Cheerio**
 - **Dotenv**
 - **Typescript**
 - **Node.js**
 - **And others...**
