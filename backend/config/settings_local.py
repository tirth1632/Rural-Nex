"""
Local development settings override.
Usage: python manage.py runserver --settings=config.settings_local
Removes django.contrib.gis and GDAL dependency so the backend
can run natively on Windows without GDAL C-libraries installed.
"""
from .settings import *

# Swap PostGIS backend for plain PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ruralnex',
        'USER': 'postgres',
        'PASSWORD': 'Vansh@1234',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Remove django.contrib.gis (requires GDAL/GEOS C-libs)
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'django.contrib.gis']

# Disable HSTS and SSL redirect for local dev
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
