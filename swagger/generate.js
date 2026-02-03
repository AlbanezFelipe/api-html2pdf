const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const doc = {
    info: {
        version: '0.0.1',
        title: 'API HTML To PDF',
        description: 'Convert HTML templates to PDF'
    },
    host: 'localhost:8000',
    schemes: ['http']
};

const outputFile = './swagger/output.json';
const endpointsFiles = ['./routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);