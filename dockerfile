FROM node:alpine

WORKDIR /market-app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD [ "node",'/dist/main.js' ]