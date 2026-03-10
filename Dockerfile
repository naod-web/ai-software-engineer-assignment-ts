FROM node:18-alpine 
 
# Bypass all SSL certificate checks 
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/main" 
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/community" 
RUN apk update --no-cache --allow-untrusted 
 
# Configure npm to ignore SSL 
RUN npm config set strict-ssl false 
RUN npm config set registry http://registry.npmjs.org/ 
 
WORKDIR /app 
 
COPY package.json ./ 
RUN npm install --no-audit --no-fund --maxsockets 1 
 
COPY . . 
 
CMD ["npm", "test"] 
