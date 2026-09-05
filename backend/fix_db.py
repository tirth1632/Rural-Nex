import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE users_userprofile ADD COLUMN experience varchar(10) NULL;")
        print("Added experience column.")
    except Exception as e:
        print(f"Error adding experience: {e}")
        connection.rollback()
        
    try:
        cursor.execute("ALTER TABLE users_userprofile ADD COLUMN own_capital numeric(12, 2) NULL;")
        print("Added own_capital column.")
    except Exception as e:
        print(f"Error adding own_capital: {e}")
        connection.rollback()
        
    try:
        cursor.execute("ALTER TABLE users_userprofile ADD COLUMN business_interest varchar(100) NULL;")
        print("Added business_interest column.")
    except Exception as e:
        print(f"Error adding business_interest: {e}")
        connection.rollback()
