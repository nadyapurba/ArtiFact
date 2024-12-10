# Gunakan image Node.js
FROM node:16

# Set directory untuk aplikasi
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json untuk install dependensi
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh file aplikasi
COPY . .

# Tentukan port yang akan digunakan
EXPOSE 8080

# Jalankan aplikasi
CMD ["npm", "start"]
