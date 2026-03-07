const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { verifyToken } = require('../middleware/auth');
const { Transaction, Customer, Employee } = require('../config/db');

const invoicesDir = path.join(__dirname, '../../../invoices');
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

// POST /api/invoices/generate
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { transaction_id } = req.body;
        if (!transaction_id) return res.status(400).json({ error: 'transaction_id is required' });

        const txn = await Transaction.findByPk(transaction_id, {
            include: [
                { model: Customer, attributes: ['full_name', 'phone_number', 'address', 'email'] },
                { model: Employee, attributes: ['full_name'] }
            ]
        });
        if (!txn) return res.status(404).json({ error: 'Transaction not found' });

        const invoiceNumber = txn.invoice_number || `INV-${Date.now()}`;
        const filename = `${invoiceNumber}.pdf`;
        const filepath = path.join(invoicesDir, filename);

        // Generate PDF
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        // ─── Header ───────────────────────────────────────────────────────────
        doc.rect(0, 0, 612, 120).fill('#1e3a5f');
        doc.fillColor('white')
           .fontSize(26).font('Helvetica-Bold')
           .text('CareAll Digital Services', 50, 30);
        doc.fontSize(11).font('Helvetica')
           .text('Fastag | PAN Card | DSC | Insurance | Aadhaar', 50, 62)
           .text('📞 9042010180 | care@careall.in', 50, 80);

        doc.fillColor('#f59e0b').fontSize(14).font('Helvetica-Bold')
           .text('INVOICE', 460, 40);
        doc.fillColor('white').fontSize(10).font('Helvetica')
           .text(`# ${invoiceNumber}`, 460, 62)
           .text(new Date().toLocaleDateString('en-IN'), 460, 78);

        // ─── Bill To ──────────────────────────────────────────────────────────
        doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold')
           .text('Bill To:', 50, 145);
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a5f')
           .text(txn.Customer?.full_name || 'N/A', 50, 162);
        doc.fontSize(10).font('Helvetica').fillColor('#475569')
           .text(`Phone: ${txn.Customer?.phone_number || ''}`, 50, 180)
           .text(`Email: ${txn.Customer?.email || ''}`, 50, 196)
           .text(`Address: ${txn.Customer?.address || ''}`, 50, 212);

        // Right side: invoice meta
        doc.fontSize(10).font('Helvetica').fillColor('#475569')
           .text(`Served By: ${txn.Employee?.full_name || ''}`, 360, 162)
           .text(`Payment Mode: ${txn.payment_mode}`, 360, 178)
           .text(`Payment Status: ${txn.payment_status}`, 360, 194)
           .text(`Date: ${new Date(txn.createdAt).toLocaleDateString('en-IN')}`, 360, 210);

        // ─── Line ─────────────────────────────────────────────────────────────
        doc.moveTo(50, 240).lineTo(562, 240).strokeColor('#cbd5e1').stroke();

        // ─── Table Header ─────────────────────────────────────────────────────
        doc.rect(50, 255, 512, 28).fill('#1e3a5f');
        doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
           .text('Service', 60, 264)
           .text('Description', 200, 264)
           .text('Amount', 490, 264, { align: 'right' });

        // ─── Table Row ────────────────────────────────────────────────────────
        doc.rect(50, 283, 512, 30).fill('#f8fafc');
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica')
           .text(txn.service_type, 60, 293)
           .text(txn.notes || '—', 200, 293)
           .text(`₹ ${Number(txn.amount).toFixed(2)}`, 490, 293, { align: 'right' });

        // ─── Total ────────────────────────────────────────────────────────────
        doc.moveTo(50, 325).lineTo(562, 325).strokeColor('#cbd5e1').stroke();
        doc.fillColor('#1e3a5f').fontSize(13).font('Helvetica-Bold')
           .text('Total Amount:', 360, 340)
           .text(`₹ ${Number(txn.amount).toFixed(2)}`, 490, 340, { align: 'right' });

        // ─── Footer ───────────────────────────────────────────────────────────
        doc.rect(0, 750, 612, 92).fill('#1e3a5f');
        doc.fillColor('white').fontSize(10).font('Helvetica')
           .text('Thank you for choosing CareAll Digital Services!', 50, 765, { align: 'center', width: 512 })
           .fontSize(9)
           .text('This is a computer-generated invoice and does not require a signature.', 50, 785, { align: 'center', width: 512 });

        doc.end();

        writeStream.on('finish', () => {
            // Update invoice number on transaction
            txn.update({ invoice_number: invoiceNumber }).catch(() => {});
            res.json({ invoiceNumber, downloadUrl: `/invoices/${filename}`, filename });
        });

        writeStream.on('error', (err) => {
            res.status(500).json({ error: 'PDF generation failed: ' + err.message });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/invoices/:id/download — redirect to static file
router.get('/:filename/download', verifyToken, (req, res) => {
    const filepath = path.join(invoicesDir, req.params.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Invoice not found' });
    res.download(filepath);
});

module.exports = router;
