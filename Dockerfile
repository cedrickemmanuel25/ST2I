FROM python:3.10-slim

WORKDIR /app

# Copier les dépendances
COPY requirements.txt .

# Installer les outils nécessaires et les dépendances Python
RUN apt-get update && apt-get install -y gcc && \
    pip install --no-cache-dir -r requirements.txt

# Copier le reste du projet (l'API)
COPY . .

# Exposer le port par défaut 7860 pour Hugging Face Spaces
EXPOSE 7860

# Lancer FastAPI avec Uvicorn sur le port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
