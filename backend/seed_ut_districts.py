import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from geo.models import State, District

# Districts for Union Territories
ut_districts = {
    "Delhi": [
        "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
        "North East Delhi", "North West Delhi", "Shahdara",
        "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
    ],
    "Jammu and Kashmir": [
        "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda",
        "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam",
        "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban",
        "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
    ],
    "Ladakh": ["Kargil", "Leh"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    "Andaman and Nicobar Islands": [
        "Nicobar", "North and Middle Andaman", "South Andaman"
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
        "Dadra and Nagar Haveli", "Daman", "Diu"
    ],
    "Lakshadweep": ["Lakshadweep"],
}

print("Seeding UT districts...")
total_added = 0

for state_name, districts in ut_districts.items():
    try:
        state = State.objects.get(name__iexact=state_name)
    except State.DoesNotExist:
        print(f"ERROR: State/UT '{state_name}' not found!")
        continue

    added = 0
    for d_name in districts:
        _, created = District.objects.get_or_create(state=state, name=d_name)
        if created:
            added += 1
            total_added += 1

    print(f"Added {added} districts for {state_name}")

print(f"\nFinished! Added {total_added} UT districts in total.")
