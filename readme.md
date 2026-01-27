# Production
```
docker build -t html2pdf:production .
```

# Development
```
docker build --build-arg NODE_ENV=development -t html2pdf:dev .
```

# Run container
```
docker compose up
```
or
```
docker run -p 8000:8000 -it --rm --env-file .env html2pdf:dev
```