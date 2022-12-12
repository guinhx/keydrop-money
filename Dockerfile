FROM node:latest

RUN mkdir -p /usr/src/keydrop
WORKDIR /usr/src/keydrop

COPY ./package.json /package.json
COPY ./package-lock.json /package-lock.json
COPY ./tsconfig.json /tsconfig.json
COPY ./src /src

RUN npm install
RUN npm run build

RUN rm -rf /src

COPY ./.env /dist/.env

ENV TZ=America/Sao_Paulo

RUN npm install

CMD ["npm", "run", "start:prod"]