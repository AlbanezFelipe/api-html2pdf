# Production
docker build -t html2pdf:production .

# Development
docker build --build-arg NODE_ENV=development -t html2pdf:dev .