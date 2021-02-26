# Our first stage, that is the Builder
FROM node:8-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run clean
RUN npm run build
# Our Second stage, that creates an image for production
FROM node:8-alpine AS ts-sample-prod
WORKDIR /app
EXPOSE 5000
COPY --from=build ./app/dist ./dist
COPY package* ./
RUN npm install --production
CMD npm start