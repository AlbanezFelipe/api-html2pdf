import hmac
import hashlib
import requests

# Shared secret key
SECRET_KEY = b'123'

# Request data
data = b"{\"hello\":\"world\"}"

# Generate HMAC
hmac_hash = hmac.new(SECRET_KEY, data, hashlib.sha256).hexdigest()

print(hmac_hash)

# Send request with HMAC in the headers
headers = {"Authorization": hmac_hash}
response = requests.get("http://localhost:8000/hmac", headers=headers)

# Print server response
print(response.status_code, response.text)