# Verwende das Node LTS-Image
FROM node:lts

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Dateien kopieren
COPY . .

# Abhängigkeiten installieren
RUN npm install

# App bauen
RUN npm run build

# Start-Befehl
CMD ["npm", "run", "start"]
