import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from geo.models import State

# Add remaining UTs not in seed_states.py
uts_data = {
    "Delhi": "DL",
    "Jammu and Kashmir": "JK",
    "Ladakh": "LA",
    "Chandigarh": "CH",
    "Puducherry": "PY",
    "Andaman and Nicobar Islands": "AN",
    "Dadra and Nagar Haveli and Daman and Diu": "DD",
    "Lakshadweep": "LD",
}

print("Seeding Union Territories...")
added = 0
for name, code in uts_data.items():
    state, created = State.objects.get_or_create(
        name=name,
        defaults={"code": code}
    )
    if created:
        print(f"Added UT {name} ({code})")
        added += 1
    else:
        print(f"UT {name} already exists.")

print(f"Finished seeding UTs! Added {added} new territories.")
