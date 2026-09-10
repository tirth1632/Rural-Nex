import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
    'Content-Type': 'application/json'
}

url = 'https://api.myscheme.gov.in/schemes/v6/public/schemes'

test_slugs = [
    "pmegp", "pm-mudra", "pm-vishwakarma", "pmfme", "ahidf", "pmmsy", "pm-kusum", 
    "standup-india", "day-nrlm", "namo-drone-didi", "pm-surya-ghar", "agri-infra-fund"
]

res = requests.post(url, headers=headers, json=test_slugs)
if res.status_code == 200:
    data = res.json().get('data', [])
    print(f"Successfully fetched {len(data)} official schemes from MyScheme.gov.in!")
    for s in data:
        en = s.get('en', {})
        bd = en.get('basicDetails', {})
        sc = en.get('schemeContent', {})
        print(f" - {bd.get('schemeName')} ({bd.get('schemeShortTitle')})")
        print(f"   Ministry: {bd.get('nodalMinistryName', {}).get('label')}")
        print(f"   Tags: {bd.get('tags')}")
        print(f"   Desc: {sc.get('briefDescription')[:100]}...\n")
else:
    print("Failed to fetch:", res.status_code)
