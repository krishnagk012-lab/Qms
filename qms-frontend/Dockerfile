FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Render passes VITE_API_URL or we use a build arg — inject into environment.prod.ts
ARG API_URL=https://qms-backend.onrender.com/api
RUN sed -i "s|apiUrl: \"/api\"|apiUrl: \"${API_URL}\"|g" src/environments/environment.prod.ts

RUN npm run build

FROM nginx:1.25-alpine
COPY --from=build /app/dist/qms-frontend/browser /usr/share/nginx/html
COPY nginx.render.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
