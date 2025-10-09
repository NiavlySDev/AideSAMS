// Export utilities for PDF and Word documents
class ExportManager {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
        this.html2canvas = window.html2canvas;
    }

    async exportPDF() {
        if (!this.jsPDF) {
            showNotification('Erreur: jsPDF non disponible', 'error');
            return;
        }

        try {
            showNotification('Génération du PDF en cours...', 'info');
            
            const element = document.querySelector('.document-template');
            if (!element) {
                showNotification('Aucun document à exporter', 'error');
                return;
            }

            // Create a clone to avoid modifying the original
            const clone = element.cloneNode(true);
            
            // Optimize for PDF export
            this.optimizeForPDF(clone);
            
            // Create a temporary container
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.background = 'white';
            tempContainer.appendChild(clone);
            document.body.appendChild(tempContainer);

            // Generate canvas
            const canvas = await this.html2canvas(clone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // A4 width at 96 DPI
                height: 1123 // A4 height at 96 DPI
            });

            // Clean up
            document.body.removeChild(tempContainer);

            // Create PDF
            const pdf = new this.jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const filename = this.generateFilename('pdf');
            pdf.save(filename);
            
            showNotification('PDF exporté avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            showNotification('Erreur lors de l\'export PDF', 'error');
        }
    }

    async exportWord() {
        try {
            showNotification('Génération du document Word en cours...', 'info');
            
            const element = document.querySelector('.document-template');
            if (!element) {
                showNotification('Aucun document à exporter', 'error');
                return;
            }

            // Get the HTML content
            const htmlContent = this.prepareHTMLForWord(element);
            
            // Create Word document content
            const wordContent = this.generateWordDocument(htmlContent);
            
            // Create blob and download
            const blob = new Blob([wordContent], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            
            const filename = this.generateFilename('docx');
            this.downloadBlob(blob, filename);
            
            showNotification('Document Word exporté avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'export Word:', error);
            showNotification('Erreur lors de l\'export Word', 'error');
        }
    }

    optimizeForPDF(element) {
        // Ensure all text is visible
        const inputs = element.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value) {
                const span = document.createElement('span');
                span.textContent = input.value;
                span.style.borderBottom = '1px solid #000';
                span.style.display = 'inline-block';
                span.style.minWidth = input.offsetWidth + 'px';
                span.style.padding = '2px 5px';
                input.parentNode.replaceChild(span, input);
            }
        });

        // Handle select elements
        const selects = element.querySelectorAll('select');
        selects.forEach(select => {
            if (select.value) {
                const span = document.createElement('span');
                span.textContent = select.options[select.selectedIndex].text;
                span.style.borderBottom = '1px solid #000';
                span.style.display = 'inline-block';
                span.style.minWidth = select.offsetWidth + 'px';
                span.style.padding = '2px 5px';
                select.parentNode.replaceChild(span, select);
            }
        });

        // Ensure signatures are visible
        const signatureContents = element.querySelectorAll('.signature-content');
        signatureContents.forEach(content => {
            if (content.innerHTML.trim()) {
                content.style.display = 'block';
                content.style.textAlign = 'center';
            }
        });
    }

    prepareHTMLForWord(element) {
        const clone = element.cloneNode(true);
        
        // Convert inputs to spans with values
        const inputs = clone.querySelectorAll('input, select');
        inputs.forEach(input => {
            const value = input.type === 'select-one' ? 
                input.options[input.selectedIndex]?.text || '' : 
                input.value || '';
            
            if (value) {
                const span = document.createElement('span');
                span.textContent = value;
                span.style.textDecoration = 'underline';
                input.parentNode.replaceChild(span, input);
            } else {
                const span = document.createElement('span');
                span.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                span.style.textDecoration = 'underline';
                input.parentNode.replaceChild(span, input);
            }
        });

        return clone.innerHTML;
    }

    generateWordDocument(htmlContent) {
        // Create a simple HTML document that Word can import
        const wordHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { 
                        font-family: 'Times New Roman', serif; 
                        font-size: 12pt; 
                        line-height: 1.6;
                        margin: 2cm;
                    }
                    .document-header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        border-bottom: 2pt solid black; 
                        padding-bottom: 15pt; 
                        margin-bottom: 30pt; 
                    }
                    .document-title { 
                        text-align: center; 
                        font-size: 16pt; 
                        font-weight: bold; 
                        margin: 30pt 0; 
                        text-decoration: underline; 
                    }
                    .form-section { 
                        margin: 20pt 0; 
                        background: #f0f8ff; 
                        padding: 15pt; 
                        border-radius: 5pt; 
                    }
                    .form-section h3 { 
                        background: #4169e1; 
                        color: white; 
                        padding: 8pt 15pt; 
                        margin: -15pt -15pt 15pt -15pt; 
                        border-radius: 5pt 5pt 0 0; 
                        font-size: 12pt; 
                        text-align: center; 
                    }
                    .signature-area { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-top: 50pt; 
                        padding-top: 30pt; 
                        border-top: 1pt solid #ccc; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                    }
                    td, th { 
                        border: 1pt solid black; 
                        padding: 8pt; 
                    }
                    th { 
                        background: #f0f0f0; 
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        return wordHTML;
    }

    generateFilename(extension) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
        
        let docType = 'document';
        if (documentManager.currentDocumentType) {
            switch (documentManager.currentDocumentType) {
                case 'arret-travail':
                    docType = 'arret-travail';
                    break;
                case 'certificat-naissance':
                    docType = 'certificat-naissance';
                    break;
                case 'facture-hospitalisation':
                    docType = 'facture-hospitalisation';
                    break;
            }
        }
        
        return `SAMS_${docType}_${dateStr}_${timeStr}.${extension}`;
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Global export manager instance
let exportManager = new ExportManager();

// Export functions
function exportPDF() {
    exportManager.exportPDF();
}

function exportWord() {
    exportManager.exportWord();
}

// Auto-calculate totals for invoice
function setupInvoiceCalculations() {
    if (documentManager.currentDocumentType !== 'facture-hospitalisation') return;
    
    // Add event listeners for automatic calculations
    document.addEventListener('input', function(e) {
        if (e.target.name && e.target.name.includes('_total')) {
            calculateGrandTotal();
        }
    });
}

function calculateGrandTotal() {
    const totalFields = [
        'soins_total',
        'medic_total', 
        'radio_total',
        'chir_total',
        'autres_total'
    ];
    
    let grandTotal = 0;
    totalFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && field.value) {
            const value = parseFloat(field.value.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(value)) {
                grandTotal += value;
            }
        }
    });
    
    const grandTotalField = document.querySelector('[name="total_general"]');
    if (grandTotalField) {
        grandTotalField.value = grandTotal.toFixed(2) + ' $';
    }
}

// Initialize calculations when document template is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup auto-calculations after a short delay to ensure DOM is ready
    setTimeout(setupInvoiceCalculations, 500);
});