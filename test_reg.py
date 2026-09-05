import requests

url = "http://localhost:8000/api/v1/auth/register/"
payload = {
    "first_name": "Vansh",
    "last_name": "Shah",
    "username": "vanshshah_1234",
    "email": "vansh@example.com",
    "phone_number": "9876543222",
    "password": "RuralNex2024!"
}

res = requests.post(url, json=payload)
print(f"Status Code: {res.status_code}")
print(res.text)
