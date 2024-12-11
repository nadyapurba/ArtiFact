# Gunakan image resmi Node.js versi 16 sebagai base image
FROM node:16

# Tetapkan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json untuk instalasi dependensi
COPY package*.json ./

# Install dependensi (gunakan opsi --production untuk hanya menginstall dependensi runtime)
RUN npm install --production

# Salin seluruh file aplikasi ke dalam container
COPY . .

# Ekspos port 8080 agar aplikasi dapat diakses dari luar container
EXPOSE 8080

# Tentukan perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
