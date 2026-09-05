FROM python:3.10-slim

# Install system dependencies for PostGIS/GDAL
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files, etc. can be done here or in compose

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
