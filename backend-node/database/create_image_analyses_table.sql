-- Create table for image analysis results
CREATE TABLE IF NOT EXISTS image_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    detected_injury VARCHAR(255) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    triage_level ENUM('normal', 'urgent', 'emergency') NOT NULL,
    severity_assessment TEXT,
    recommendations JSON,
    analysis_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_triage (patient_id, triage_level),
    INDEX idx_created_at (created_at)
);

-- Add image_analysis_id foreign key to triage_results table
ALTER TABLE triage_results 
ADD COLUMN image_analysis_id INT NULL,
ADD FOREIGN KEY (image_analysis_id) REFERENCES image_analyses(id) ON DELETE SET NULL;
