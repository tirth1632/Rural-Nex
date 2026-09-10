import json
import re

json_path = 'frontend/src/data/business_activities_dataset.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

cleaned_count = 0
for item in data:
    orig_name = item.get('name', '')
    # Strip leading numbers like '0402 ', '0101 ', '10. ', '01 - '
    cleaned = re.sub(r'^\d+\s*[-.:]?\s*', '', orig_name).strip()
    if orig_name != cleaned:
        print(f"'{orig_name}' -> '{cleaned}'")
        item['name'] = cleaned
        cleaned_count += 1

print(f"\nTotal names updated: {cleaned_count}")

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved cleaned dataset to frontend/src/data/business_activities_dataset.json")
