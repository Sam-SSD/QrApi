const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static('public'));

// Servir qr-code-styling desde node_modules
app.use('/lib', express.static(path.join(__dirname, 'node_modules/qr-code-styling/lib')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para validar QR
app.post('/api/validate-qr', (req, res) => {
    try {
        const { text } = req.body;
        const isValid = text && text.length > 0 && text.length <= 4296;
        res.json({ valid: isValid, maxLength: 4296 });
    } catch (error) {
        res.status(500).json({ error: 'Error validating text' });
    }
});

// API para exportar PDF
app.post('/api/export-pdf', (req, res) => {
    try {
        const { imageData, filename = 'qr-export.pdf', width, height } = req.body;

        if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/png;base64,')) {
            return res.status(400).json({ error: 'Invalid image data' });
        }

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const pageWidth = Number(width) || 595.28;
        const pageHeight = Number(height) || 841.89;

        const pdf = new PDFDocument({
            size: [pageWidth, pageHeight],
            margin: 0,
            autoFirstPage: false
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        pdf.pipe(res);
        pdf.addPage({ size: [pageWidth, pageHeight], margin: 0 });

        pdf.image(imageBuffer, 0, 0, {
            width: pageWidth,
            height: pageHeight
        });

        pdf.end();
    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({ error: 'Error exporting PDF' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 QR Generator Server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and visit the URL above`);
});
