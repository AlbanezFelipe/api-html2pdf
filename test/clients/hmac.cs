using System.Security.Cryptography;
using System.Text;

string ComputeHmacHex(string secretKey, string data)
{
    var keyBytes = Encoding.UTF8.GetBytes(secretKey);
    var dataBytes = Encoding.UTF8.GetBytes(data);

    using var hmac = new HMACSHA256(keyBytes);
    var hashBytes = hmac.ComputeHash(dataBytes);

    return Convert.ToHexString(hashBytes).ToLowerInvariant();
}

string secret = "123";
string data = "{\"hello\":\"world\"}";

string hmacHash = ComputeHmacHex(secret, data);
Console.WriteLine(hmacHash);