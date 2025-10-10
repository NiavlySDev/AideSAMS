// Export utilities for PDF and Word documents
class ExportManager {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
        this.html2canvas = window.html2canvas;
        this.sharedDocuments = new Map();
        this.signedDocuments = new Map();
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

            // Generate canvas with good quality
            const canvas = await this.html2canvas(clone, {
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Clean up
            document.body.removeChild(tempContainer);

            // Create PDF - FORCE TO FIT EVERYTHING ON ONE PAGE
            const pdf = new this.jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 10; // Reasonable margin in mm
            
            const maxWidth = pageWidth - (2 * margin);  // Available width
            const maxHeight = pageHeight - (2 * margin); // Available height
            
            // Calculate dimensions to fit content intelligently
            const canvasAspectRatio = canvas.width / canvas.height;
            const pageAspectRatio = maxWidth / maxHeight;
            
            let finalWidth, finalHeight;
            
            if (canvasAspectRatio > pageAspectRatio) {
                // Content is wider - fit to width
                finalWidth = maxWidth;
                finalHeight = maxWidth / canvasAspectRatio;
            } else {
                // Content is taller - fit to height
                finalHeight = maxHeight;
                finalWidth = maxHeight * canvasAspectRatio;
            }
            
            // Ensure minimum readable size - if too small, limit the reduction
            const minScale = 0.6; // Don't scale below 60% of available space
            const currentScale = Math.min(finalWidth / maxWidth, finalHeight / maxHeight);
            
            if (currentScale < minScale) {
                const adjustedScale = minScale;
                finalWidth = maxWidth * adjustedScale;
                finalHeight = maxHeight * adjustedScale;
            }
            
            // Center the content on the page
            const xPosition = margin + (maxWidth - finalWidth) / 2;
            const yPosition = margin + (maxHeight - finalHeight) / 2;
            
            // Add image scaled to fit ENTIRELY on one page
            pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight);

            // Generate filename
            const filename = this.generateFilename('pdf');
            pdf.save(filename);
            
            showNotification('PDF exporté avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            showNotification('Erreur lors de l\'export PDF', 'error');
        }
    }



    optimizeForPDF(element) {
        // BALANCED OPTIMIZATION - READABLE BUT FITS ON ONE PAGE
        
        // Add SAMS logo to document header if not present
        this.addSAMSLogo(element);
        
        // Reasonable padding and margins
        element.style.padding = '15px';
        element.style.margin = '0';
        
        // Readable font sizes
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.4';
        
        // Moderate section compression
        const sections = element.querySelectorAll('.form-section, .document-section');
        sections.forEach(section => {
            section.style.marginBottom = '10px';
            section.style.marginTop = '5px';
            section.style.padding = '10px';
        });
        
        // Readable headers with moderate compression
        const headers = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach(header => {
            header.style.margin = '8px 0 6px 0';
            header.style.padding = '0';
            if (header.tagName === 'H1') header.style.fontSize = '18px';
            if (header.tagName === 'H2') header.style.fontSize = '16px';
            if (header.tagName === 'H3') header.style.fontSize = '14px';
            if (header.tagName === 'H4') header.style.fontSize = '13px';
        });
        
        // Keep text elements readable
        const textElements = element.querySelectorAll('p, span, div, label');
        textElements.forEach(el => {
            if (!el.querySelector('input, select')) { // Don't modify elements containing form fields
                el.style.margin = '3px 0';
                el.style.fontSize = '11px';
                el.style.lineHeight = '1.3';
            }
        });

        // Convert inputs with readable styling
        const inputs = element.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value) {
                const span = document.createElement('span');
                span.textContent = input.value;
                span.style.borderBottom = '1px solid #000';
                span.style.display = 'inline-block';
                span.style.minWidth = input.offsetWidth + 'px';
                span.style.padding = '2px 4px';
                span.style.fontSize = '11px';
                span.style.lineHeight = '1.3';
                input.parentNode.replaceChild(span, input);
            }
        });

        // Handle select elements with readable styling
        const selects = element.querySelectorAll('select');
        selects.forEach(select => {
            if (select.value) {
                const span = document.createElement('span');
                span.textContent = select.options[select.selectedIndex].text;
                span.style.borderBottom = '1px solid #000';
                span.style.display = 'inline-block';
                span.style.minWidth = select.offsetWidth + 'px';
                span.style.padding = '2px 4px';
                span.style.fontSize = '11px';
                span.style.lineHeight = '1.3';
                select.parentNode.replaceChild(span, select);
            }
        });

        // Proper signature areas with spacing
        const signatureAreas = element.querySelectorAll('.signature-area, .signature-section');
        signatureAreas.forEach(area => {
            area.style.marginTop = '20px';
            area.style.marginBottom = '15px';
            area.style.height = 'auto';
        });

        // Signature boxes with proper label spacing
        const signatureBoxes = element.querySelectorAll('.signature-box');
        signatureBoxes.forEach(box => {
            box.style.marginBottom = '15px';
            box.style.padding = '5px';
        });

        // Signature labels with proper spacing
        const signatureLabels = element.querySelectorAll('.signature-label');
        signatureLabels.forEach(label => {
            label.style.marginBottom = '8px';
            label.style.fontSize = '11px';
            label.style.fontWeight = 'bold';
        });

        // Readable signatures with proper spacing from labels
        const signatureContents = element.querySelectorAll('.signature-content');
        signatureContents.forEach(content => {
            if (content.innerHTML.trim()) {
                content.style.display = 'block';
                content.style.textAlign = 'center';
                content.style.height = '50px';
                content.style.fontSize = '10px';
                content.style.margin = '8px 0 5px 0';
                content.style.padding = '5px';
                content.style.border = '1px solid #ccc';
            }
        });

        // Handle signature canvases properly
        const signatureCanvases = element.querySelectorAll('.signature-canvas, canvas');
        signatureCanvases.forEach(canvas => {
            canvas.style.display = 'block';
            canvas.style.margin = '8px auto 5px auto';
            canvas.style.border = '1px solid #ccc';
            canvas.style.backgroundColor = '#fff';
            canvas.style.maxHeight = '50px';
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
        });

        // Readable tables
        const tables = element.querySelectorAll('table');
        tables.forEach(table => {
            table.style.fontSize = '10px';
            table.style.borderSpacing = '0';
            table.style.margin = '5px 0';
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.padding = '3px 5px';
                cell.style.fontSize = '10px';
                cell.style.lineHeight = '1.2';
            });
        });

        // Fix any overlapping elements
        const allSignatureElements = element.querySelectorAll('[class*="signature"]');
        allSignatureElements.forEach(el => {
            el.style.position = 'relative';
            el.style.zIndex = 'auto';
            el.style.overflow = 'visible';
        });
    }

    addSAMSLogo(element) {
        // Check if logo already exists
        const existingLogo = element.querySelector('.sams-logo, .logo');
        if (existingLogo) {
            // Replace existing logo with SAMS logo
            this.replaceLogo(existingLogo);
            return;
        }

        // Find document header or create one
        let header = element.querySelector('.document-header, .header');
        if (!header) {
            // Create header if doesn't exist
            header = document.createElement('div');
            header.className = 'document-header';
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
            `;
            element.insertBefore(header, element.firstChild);
        }

        // Create logo section
        const logoSection = document.createElement('div');
        logoSection.className = 'logo-section';
        logoSection.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        // Create logo image
        const logoImg = document.createElement('img');
        logoImg.src = './images/sams-logo.png';
        logoImg.alt = 'SAMS Logo';
        logoImg.className = 'sams-logo';
        logoImg.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 10px;
            object-fit: cover;
        `;

        // Create organization info
        const orgInfo = document.createElement('div');
        orgInfo.style.cssText = `
            text-align: center;
            margin-left: 20px;
        `;

        const orgTitle = document.createElement('h2');
        orgTitle.textContent = 'San Andreas Medical Services';
        orgTitle.style.cssText = `
            margin: 0;
            color: #333;
            font-size: 16px;
        `;

        const orgSlogan = document.createElement('p');
        orgSlogan.textContent = 'Notre Priorité, Votre Santé';
        orgSlogan.style.cssText = `
            margin: 0;
            font-style: italic;
            color: #666;
            font-size: 12px;
        `;

        // Assemble logo section
        orgInfo.appendChild(orgTitle);
        orgInfo.appendChild(orgSlogan);
        logoSection.appendChild(logoImg);
        logoSection.appendChild(orgInfo);

        // Add date section if not present
        let dateSection = header.querySelector('.date-section');
        if (!dateSection) {
            dateSection = document.createElement('div');
            dateSection.className = 'date-section';
            dateSection.style.cssText = `
                text-align: right;
                font-size: 11px;
                color: #666;
            `;
            
            const dateP = document.createElement('p');
            dateP.textContent = `Date: ${new Date().toLocaleDateString('fr-FR')}`;
            dateP.style.margin = '0';
            
            const timeP = document.createElement('p');
            timeP.textContent = `Heure: ${new Date().toLocaleTimeString('fr-FR')}`;
            timeP.style.margin = '0';
            
            dateSection.appendChild(dateP);
            dateSection.appendChild(timeP);
        }

        // Clear existing header content and rebuild
        header.innerHTML = '';
        header.appendChild(logoSection);
        header.appendChild(dateSection);
    }

    replaceLogo(existingLogo) {
        // Replace existing logo with SAMS logo
        const logoImg = document.createElement('img');
        logoImg.src = './images/sams-logo.png';
        logoImg.alt = 'SAMS Logo';
        logoImg.className = 'sams-logo';
        logoImg.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        `;
        
        // Replace the existing logo
        if (existingLogo.tagName === 'IMG') {
            existingLogo.parentNode.replaceChild(logoImg, existingLogo);
        } else {
            // If it's a div with background or other element, replace content
            existingLogo.innerHTML = '';
            existingLogo.appendChild(logoImg);
            existingLogo.style.cssText = `
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
            `;
        }
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

    // Document sharing and signature management
    shareDocumentWithParents(password = null) {
        const element = document.querySelector('.document-template');
        if (!element) {
            showNotification('Aucun document à partager', 'error');
            return null;
        }

        // Generate unique share ID
        const shareId = this.generateShareId();
        
        // Generate random password if not provided
        if (!password) {
            password = this.generatePassword();
        }

        // Store document data for sharing
        const documentData = {
            html: element.outerHTML,
            type: documentManager.currentDocumentType || 'unknown',
            createdAt: new Date().toISOString(),
            password: password,
            signatures: {
                mother: null,
                father: null
            },
            status: 'pending'
        };

        // Store in localStorage (in real app, this would be server-side)
        localStorage.setItem(`shared_document_${shareId}`, JSON.stringify(documentData));
        this.sharedDocuments.set(shareId, documentData);

        // Generate shareable link
        const shareLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}parent-signature.html?id=${shareId}`;

        return {
            shareId,
            password,
            shareLink,
            qrCode: this.generateQRCodeData(shareLink)
        };
    }

    generateShareId() {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    generateQRCodeData(url) {
        // This would normally use a QR code library
        return `QR Code for: ${url}`;
    }

    checkSignatureStatus(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        return {
            motherSigned: !!documentData.signatures.mother,
            fatherSigned: !!documentData.signatures.father,
            allSigned: !!(documentData.signatures.mother && documentData.signatures.father),
            status: documentData.status
        };
    }

    getSignedDocument(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        if (!documentData.signatures.mother || !documentData.signatures.father) {
            return null; // Not fully signed
        }

        // Create signed version with signatures
        const signedDoc = this.createSignedDocument(documentData);
        return signedDoc;
    }

    createSignedDocument(documentData) {
        const element = document.createElement('div');
        element.innerHTML = documentData.html;

        // Add signatures to the document
        const signaturesSection = document.createElement('div');
        signaturesSection.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            border-top: 2px solid #22c55e;
            page-break-inside: avoid;
        `;

        signaturesSection.innerHTML = `
            <h3 style="color: #22c55e; margin-bottom: 20px;">✅ Signatures des Parents</h3>
            <div style="display: flex; justify-content: space-between; gap: 40px;">
                <div style="flex: 1;">
                    <h4>Signature de la Mère</h4>
                    <img src="${documentData.signatures.mother.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Mère">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.mother.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
                <div style="flex: 1;">
                    <h4>Signature du Père</h4>
                    <img src="${documentData.signatures.father.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Père">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.father.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
            </div>
        `;

        element.appendChild(signaturesSection);
        return element.outerHTML;
    }

    loadSignedDocumentForEditing(shareId) {
        const signedDocumentHtml = this.getSignedDocument(shareId);
        if (!signedDocumentHtml) {
            showNotification('Document non trouvé ou pas encore entièrement signé', 'error');
            return false;
        }

        // Load the signed document into the current editor
        const container = document.querySelector('#documentContainer');
        if (container) {
            container.innerHTML = signedDocumentHtml;
            showNotification('Document signé chargé avec succès', 'success');
            return true;
        }
        
        return false;
    }
}

// Global export manager instance
let exportManager = new ExportManager();

// Export functions
function exportPDF() {
    exportManager.exportPDF();
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

// Global functions for sharing
function shareWithParents() {
    const shareData = exportManager.shareDocumentWithParents();
    if (!shareData) return;

    // Show sharing modal/dialog
    showSharingDialog(shareData);
}

function showSharingDialog(shareData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
            <h2 style="color: #22c55e; margin-bottom: 20px;">📤 Partager avec les Parents</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Lien de signature:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.shareLink}" 
                           id="shareLink" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <button onclick="copyToClipboard('shareLink')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Mot de passe d'accès:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.password}" 
                           id="sharePassword" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; font-weight: bold;">
                    <button onclick="copyToClipboard('sharePassword')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #0369a1;">
                    💡 <strong>Instructions:</strong><br>
                    1. Envoyez le lien aux parents<br>
                    2. Communiquez-leur le mot de passe séparément<br>
                    3. Les deux parents doivent signer le document<br>
                    4. Vous recevrez une notification une fois terminé
                </p>
            </div>
            
            <div style="text-align: right;">
                <button onclick="closeModal()" 
                        style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Fermer
                </button>
                <button onclick="checkSignatures('${shareData.shareId}')" 
                        style="padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Vérifier les signatures
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentModal = modal;
}

function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    showNotification('Copié dans le presse-papiers!', 'success');
}

function closeModal() {
    if (window.currentModal) {
        document.body.removeChild(window.currentModal);
        window.currentModal = null;
    }
}

function checkSignatures(shareId) {
    const status = exportManager.checkSignatureStatus(shareId);
    if (!status) {
        showNotification('Document non trouvé', 'error');
        return;
    }

    if (status.allSigned) {
        showNotification('✅ Toutes les signatures ont été recueillies!', 'success');
        closeModal();
        
        // Ask if doctor wants to load the signed document
        setTimeout(() => {
            const loadSigned = confirm('Voulez-vous charger le document signé pour l'éditer ou l'exporter?');
            if (loadSigned) {
                loadSignedDocument(shareId);
            }
        }, 1000);
    } else {
        const motherStatus = status.motherSigned ? '✅' : '⏳';
        const fatherStatus = status.fatherSigned ? '✅' : '⏳';
        showNotification(`Statut: Mère ${motherStatus} | Père ${fatherStatus}`, 'info');
    }
}

function loadSignedDocument(shareId) {
    const success = exportManager.loadSignedDocumentForEditing(shareId);
    if (success) {
        // Update UI to show this is a signed document
        const header = document.querySelector('.document-header');
        if (header) {
            const signedBadge = document.createElement('div');
            signedBadge.style.cssText = `
                background: #22c55e;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 15px;
                display: inline-block;
            `;
            signedBadge.textContent = '✅ DOCUMENT SIGNÉ';
            header.appendChild(signedBadge);
        }
    }
}

// Initialize calculations when document template is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup auto-calculations after a short delay to ensure DOM is ready
}

    // Document sharing and signature management
    shareDocumentWithParents(password = null) {
        const element = document.querySelector('.document-template');
        if (!element) {
            showNotification('Aucun document à partager', 'error');
            return null;
        }

        // Generate unique share ID
        const shareId = this.generateShareId();
        
        // Generate random password if not provided
        if (!password) {
            password = this.generatePassword();
        }

        // Store document data for sharing
        const documentData = {
            html: element.outerHTML,
            type: documentManager.currentDocumentType || 'unknown',
            createdAt: new Date().toISOString(),
            password: password,
            signatures: {
                mother: null,
                father: null
            },
            status: 'pending'
        };

        // Store in localStorage (in real app, this would be server-side)
        localStorage.setItem(`shared_document_${shareId}`, JSON.stringify(documentData));
        this.sharedDocuments.set(shareId, documentData);

        // Generate shareable link
        const shareLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}parent-signature.html?id=${shareId}`;

        return {
            shareId,
            password,
            shareLink,
            qrCode: this.generateQRCodeData(shareLink)
        };
    }

    generateShareId() {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    generateQRCodeData(url) {
        // This would normally use a QR code library
        return `QR Code for: ${url}`;
    }

    checkSignatureStatus(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        return {
            motherSigned: !!documentData.signatures.mother,
            fatherSigned: !!documentData.signatures.father,
            allSigned: !!(documentData.signatures.mother && documentData.signatures.father),
            status: documentData.status
        };
    }

    getSignedDocument(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        if (!documentData.signatures.mother || !documentData.signatures.father) {
            return null; // Not fully signed
        }

        // Create signed version with signatures
        const signedDoc = this.createSignedDocument(documentData);
        return signedDoc;
    }

    createSignedDocument(documentData) {
        const element = document.createElement('div');
        element.innerHTML = documentData.html;

        // Add signatures to the document
        const signaturesSection = document.createElement('div');
        signaturesSection.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            border-top: 2px solid #22c55e;
            page-break-inside: avoid;
        `;

        signaturesSection.innerHTML = `
            <h3 style="color: #22c55e; margin-bottom: 20px;">✅ Signatures des Parents</h3>
            <div style="display: flex; justify-content: space-between; gap: 40px;">
                <div style="flex: 1;">
                    <h4>Signature de la Mère</h4>
                    <img src="${documentData.signatures.mother.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Mère">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.mother.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
                <div style="flex: 1;">
                    <h4>Signature du Père</h4>
                    <img src="${documentData.signatures.father.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Père">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.father.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
            </div>
        `;

        element.appendChild(signaturesSection);
        return element.outerHTML;
    }

    loadSignedDocumentForEditing(shareId) {
        const signedDocumentHtml = this.getSignedDocument(shareId);
        if (!signedDocumentHtml) {
            showNotification('Document non trouvé ou pas encore entièrement signé', 'error');
            return false;
        }

        // Load the signed document into the current editor
        const container = document.querySelector('#documentContainer');
        if (container) {
            container.innerHTML = signedDocumentHtml;
            showNotification('Document signé chargé avec succès', 'success');
            return true;
        }
        
        return false;
    }
}

// Global functions for sharing
function shareWithParents() {
    const shareData = exportManager.shareDocumentWithParents();
    if (!shareData) return;

    // Show sharing modal/dialog
    showSharingDialog(shareData);
}

function showSharingDialog(shareData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
            <h2 style="color: #22c55e; margin-bottom: 20px;">📤 Partager avec les Parents</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Lien de signature:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.shareLink}" 
                           id="shareLink" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <button onclick="copyToClipboard('shareLink')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Mot de passe d'accès:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.password}" 
                           id="sharePassword" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; font-weight: bold;">
                    <button onclick="copyToClipboard('sharePassword')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #0369a1;">
                    💡 <strong>Instructions:</strong><br>
                    1. Envoyez le lien aux parents<br>
                    2. Communiquez-leur le mot de passe séparément<br>
                    3. Les deux parents doivent signer le document<br>
                    4. Vous recevrez une notification une fois terminé
                </p>
            </div>
            
            <div style="text-align: right;">
                <button onclick="closeModal()" 
                        style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Fermer
                </button>
                <button onclick="checkSignatures('${shareData.shareId}')" 
                        style="padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Vérifier les signatures
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentModal = modal;
}

function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    showNotification('Copié dans le presse-papiers!', 'success');
}

function closeModal() {
    if (window.currentModal) {
        document.body.removeChild(window.currentModal);
        window.currentModal = null;
    }
}

function checkSignatures(shareId) {
    const status = exportManager.checkSignatureStatus(shareId);
    if (!status) {
        showNotification('Document non trouvé', 'error');
        return;
    }

    if (status.allSigned) {
        showNotification('✅ Toutes les signatures ont été recueillies!', 'success');
        closeModal();
        
        // Ask if doctor wants to load the signed document
        setTimeout(() => {
            const loadSigned = confirm('Voulez-vous charger le document signé pour l\'éditer ou l\'exporter?');
            if (loadSigned) {
                loadSignedDocument(shareId);
            }
        }, 1000);
    } else {
        const motherStatus = status.motherSigned ? '✅' : '⏳';
        const fatherStatus = status.fatherSigned ? '✅' : '⏳';
        showNotification(`Statut: Mère ${motherStatus} | Père ${fatherStatus}`, 'info');
    }
}

function loadSignedDocument(shareId) {
    const success = exportManager.loadSignedDocumentForEditing(shareId);
    if (success) {
        // Update UI to show this is a signed document
        const header = document.querySelector('.document-header');
        if (header) {
            const signedBadge = document.createElement('div');
            signedBadge.style.cssText = `
                background: #22c55e;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 15px;
                display: inline-block;
            `;
            signedBadge.textContent = '✅ DOCUMENT SIGNÉ';
            header.appendChild(signedBadge);
        }
    }
}

// Initialize calculations when document template is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup auto-calculations after a short delay to ensure DOM is ready
    setTimeout(setupInvoiceCalculations, 500);
});