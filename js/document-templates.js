// Document templates for the three medical documents

function getArretTravailTemplate() {
    return `
        <div class="document-template">
            <div class="document-header">
                <div class="logo-section">
                    <div class="logo" style="background: none; border: none; box-shadow: none; width: 100px; height: 100px;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSIjOEIwMDAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzMzMzMzMyIvPgo8IS0tIE1lZGljYWwgQ3Jvc3MgLS0+CjxwYXRoIGQ9Ik0zNSA0MEg2NVY2MEgzNVY0MFoiIGZpbGw9IiNEQzI2MjYiLz4KPHA+YXRoIGQ9Ik00MCAzNUg2MFY2NUg0MFYzNVoiIGZpbGw9IiNEQzI2MjYiLz4KPCEtLSBDYWR1Y2V1cyBTeW1ib2wgLS0+CjxwYXRoIGQ9Ik00NS41IDI4VjcyIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNTQuNSAyOFY3MiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTQyIDQ1VjU1IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNTggNDVWNTUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjQ3IiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNGRkZGRkYiLz4KPGJ4aXJjbGUgY3g9IjUzIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNGRkZGRkYiLz4KPCEtLSBUZXh0IC0tPgo8dGV4dCB4PSI1MCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TQU4gQU5EUkVBUzwvdGV4dD4KPHR4dCB4PSI1MCIgeT0iODgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NRURJQ0FMIFNFUVZJQ0U8L3RleHQ+Cjwvc3ZnPgo=" alt="SAMS Logo" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="logo-text">
                        <strong>San Andreas Medical Services</strong><br>
                        <small>Notre Priorité, votre santé.</small>
                    </div>
                </div>
                <div class="hospital-info">
                    <div><strong>Hôpital Central</strong></div>
                    <div><strong>Eclipse Medical Tower</strong></div>
                </div>
            </div>

            <div class="document-title">Avis d'arrêt de travail</div>

            <div class="form-section">
                <h3>Le patient</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>NOM :</label>
                            <input type="text" name="patient_nom">
                        </div>
                        <div class="form-field">
                            <label>Prénom :</label>
                            <input type="text" name="patient_prenom">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>ID :</label>
                            <input type="text" name="patient_id">
                        </div>
                        <div class="form-field">
                            <label>Date de naissance :</label>
                            <input type="date" name="patient_naissance">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Âge :</label>
                            <input type="number" name="patient_age">
                        </div>
                        <div class="form-field">
                            <label>Travail :</label>
                            <input type="text" name="patient_travail">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field" style="flex: 2;">
                            <label>Adresse :</label>
                            <input type="text" name="patient_adresse">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Le médecin</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>NOM :</label>
                            <input type="text" name="medecin_nom">
                        </div>
                        <div class="form-field">
                            <label>Prénom :</label>
                            <input type="text" name="medecin_prenom">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>ID :</label>
                            <input type="text" name="medecin_id">
                        </div>
                        <div class="form-field">
                            <label>Grade :</label>
                            <input type="text" name="medecin_grade">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Valable à partir du :</label>
                            <input type="date" name="arret_debut">
                        </div>
                        <div class="form-field">
                            <label>Jusqu'au :</label>
                            <input type="date" name="arret_fin">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Travail possible :</label>
                            <select name="travail_possible">
                                <option value="">Sélectionner</option>
                                <option value="Non">Non</option>
                                <option value="Oui">Oui</option>
                                <option value="Partiel">Partiel</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field" style="flex: 2;">
                            <label>Raison de l'arrêt :</label>
                            <input type="text" name="arret_raison">
                        </div>
                    </div>
                </div>
            </div>

            <div class="signature-area">
                <div class="signature-box">
                    <div class="signature-label" style="color: #4169e1; font-weight: bold;">Signature du médecin :</div>
                    <div class="signature-line">
                        <div class="signature-content"></div>
                    </div>
                </div>
                <div class="signature-box">
                    <div class="signature-label">Date et heure :</div>
                    <div class="signature-line">
                        <div class="signature-content"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCertificatNaissanceTemplate() {
    return `
        <div class="document-template">
            <div class="document-header">
                <div class="logo-section">
                    <div class="logo">
                        <div style="font-size: 10px; line-height: 1.2;">
                            SAN ANDREAS<br>
                            MEDICAL SERVICES
                        </div>
                    </div>
                    <div class="logo-text">
                        <strong>San Andreas Medical Services</strong><br>
                        <small>State. Private. State. State.</small>
                    </div>
                </div>
                <div class="hospital-info">
                    <div><strong>Hôpital Central</strong></div>
                    <div><strong>Eclipse Medical Tower</strong></div>
                </div>
            </div>

            <div class="document-title">Certificat de naissance</div>

            <div class="form-section green">
                <h3>L'enfant</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>NOM :</label>
                            <input type="text" name="enfant_nom">
                        </div>
                        <div class="form-field">
                            <label>Prénom :</label>
                            <input type="text" name="enfant_prenom">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>ID :</label>
                            <input type="text" name="enfant_id">
                        </div>
                        <div class="form-field">
                            <label>Date de naissance :</label>
                            <input type="date" name="enfant_naissance">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Sexe :</label>
                            <select name="enfant_sexe">
                                <option value="">Sélectionner</option>
                                <option value="Masculin">Masculin</option>
                                <option value="Féminin">Féminin</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Heure de naissance :</label>
                            <input type="time" name="enfant_heure">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Taille :</label>
                            <input type="text" name="enfant_taille">
                        </div>
                        <div class="form-field">
                            <label>Poids :</label>
                            <input type="text" name="enfant_poids">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section green">
                <h3>La mère</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>Prénom et NOM :</label>
                            <input type="text" name="mere_nom">
                        </div>
                        <div class="form-field">
                            <label>Date de naissance :</label>
                            <input type="date" name="mere_naissance">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Âge :</label>
                            <input type="number" name="mere_age">
                        </div>
                        <div class="form-field">
                            <label>Nationalité :</label>
                            <input type="text" name="mere_nationalite">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section green">
                <h3>Le père</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>Prénom et NOM :</label>
                            <input type="text" name="pere_nom">
                        </div>
                        <div class="form-field">
                            <label>Date de naissance :</label>
                            <input type="date" name="pere_naissance">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label>Âge :</label>
                            <input type="number" name="pere_age">
                        </div>
                        <div class="form-field">
                            <label>Nationalité :</label>
                            <input type="text" name="pere_nationalite">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section green">
                <h3>Le médecin</h3>
                <div class="form-section-content">
                    <div class="form-row">
                        <div class="form-field">
                            <label>Prénom et NOM :</label>
                            <input type="text" name="medecin_nom_complet">
                        </div>
                        <div class="form-field">
                            <label>ID :</label>
                            <input type="text" name="medecin_id_cert">
                        </div>
                    </div>
                </div>
            </div>

            <div class="signature-area">
                <div class="signature-box">
                    <div class="signature-label">Signature du médecin</div>
                    <div class="signature-line">
                        <div class="signature-content"></div>
                    </div>
                </div>
                <div class="signature-box">
                    <div class="signature-label">Signature des parents</div>
                    <div class="signature-line">
                        <div class="signature-content" id="parents-signature"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getFactureHospitalisationTemplate() {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('fr-FR');
    
    return `
        <div class="document-template">
            <div class="document-header">
                <div class="logo-section">
                    <div class="logo">
                        <div style="font-size: 10px; line-height: 1.2;">
                            SAN ANDREAS<br>
                            MEDICAL SERVICES
                        </div>
                    </div>
                    <div class="logo-text">
                        <strong>San Andreas<br>Medical Services</strong><br>
                        <small>State. Private. State. State.</small>
                    </div>
                </div>
                <div class="hospital-info">
                    <div><strong>Los Santos Medical Services</strong></div>
                    <div><strong>Hôpital Eclipse Medical tower</strong></div>
                    <div style="margin-top: 20px; text-align: right;">
                        <div>Le XX/XX/20XX</div>
                        <div><strong>Los Santos</strong></div>
                    </div>
                </div>
            </div>

            <div class="document-title">Facture de Frais d'Hospitalisation</div>

            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <div style="margin-bottom: 15px;">
                    <strong>Date de la facture :</strong> 
                    <input type="date" name="facture_date" style="border: none; border-bottom: 2px dotted #333; background: transparent; padding: 4px; margin-left: 10px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Patient :</strong> 
                    <input type="text" name="patient_nom_facture" style="border: none; border-bottom: 2px dotted #333; background: transparent; width: 350px; padding: 4px; margin-left: 10px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Médecin traitant :</strong> 
                    <input type="text" name="medecin_traitant" style="border: none; border-bottom: 2px dotted #333; background: transparent; width: 300px; padding: 4px; margin-left: 10px;">
                </div>
            </div>

            <div style="margin: 40px 0;">
                <h3 style="color: #333; margin-bottom: 20px; font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px;">Détails des frais</h3>
                <table class="document-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; width: 35%;">Description des services</th>
                            <th style="width: 25%;">Quantité</th>
                            <th style="width: 20%;">Prix Unitaire</th>
                            <th style="width: 20%;">Total ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Soins</strong></td>
                            <td style="text-align: center;">
                                <input type="text" name="soins_quantite">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="soins_prix">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="soins_total">
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Médicaments</strong></td>
                            <td style="text-align: center;">
                                <input type="text" name="medic_quantite">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="medic_prix">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="medic_total">
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Radiologie / Imagerie médicale</strong></td>
                            <td style="text-align: center;">
                                <input type="text" name="radio_quantite">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="radio_prix">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="radio_total">
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Chirurgie (si applicable)</strong></td>
                            <td style="text-align: center;">
                                <input type="text" name="chir_quantite">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="chir_prix">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="chir_total">
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Autres frais (précisez)</strong></td>
                            <td style="text-align: center;">
                                <input type="text" name="autres_quantite">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="autres_prix">
                            </td>
                            <td style="text-align: center;">
                                <input type="text" name="autres_total">
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="total-section">
                    <strong style="font-size: 16px;">Total des frais d'hospitalisation : 
                    <input type="text" name="total_general" style="border: none; border-bottom: 3px solid #000; background: transparent; font-weight: bold; text-align: right; width: 120px; font-size: 16px; margin-left: 10px;">
                    </strong>
                </div>
                
                <div style="margin-top: 40px; color: #666; line-height: 1.6;">
                    <div style="margin-bottom: 25px;">
                        <strong>Fait à Los Santos le</strong> 
                        <input type="date" name="date_signature" style="border: none; border-bottom: 1px solid #333; background: transparent; margin: 0 10px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <input type="text" name="medecin_signature_nom" style="border: none; border-bottom: 1px dotted #333; background: transparent; width: 300px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <input type="text" name="medecin_grade_facture" style="border: none; border-bottom: 1px dotted #333; background: transparent; width: 200px;">
                    </div>
                </div>
            </div>

            <div class="final-signature">
                <div class="signature-line">
                    <div class="signature-content"></div>
                </div>
                <div style="margin-top: 15px; font-size: 18px; font-style: italic; font-weight: bold;">Signature</div>
            </div>
        </div>
    `;
}