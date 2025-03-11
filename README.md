npm install express pocketbase uuid
// to start the server 
node shortUrlService.js


// shorten
curl --location 'http://localhost:3000/shorten' \
--header 'Content-Type: application/json' \
--data '{
           "url": "https://example.com",
           "expiration": "2025-12-31T23:59:59.000Z"
         }'

{
    "shortCode": "f77cb5"
}

// recent
curl --location 'http://localhost:3000/urls/recent'

[
    {
        "shortCode": "e75e2c",
        "url": "https://example.com"
    },
    {
        "shortCode": "e452c8",
        "url": "https://openai.com"
    },
    {
        "shortCode": "bfab8b",
        "url": "https://github123.com"
    },
    {
        "shortCode": "665171",
        "url": "https://googlextz.com"
    },
    {
        "shortCode": "91df40",
        "url": "https://openai.com"
    }
]

//batch
curl --location 'http://localhost:3000/urls/batch' \
--header 'Content-Type: application/json' \
--data '{
    "urls": [
        "https://googlextz.com",
        "https://github123.com",
        "https://openai.com"
    ]
}'

[
    {
        "shortCode": "f4a748",
        "url": "https://googlextz.com"
    },
    {
        "shortCode": "2200e1",
        "url": "https://github123.com"
    },
    {
        "shortCode": "c3ce49",
        "url": "https://openai.com"
    }
]

