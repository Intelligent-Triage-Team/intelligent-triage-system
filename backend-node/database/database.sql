-- Create Database
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- =========================
-- 1️⃣ USERS TABLE
-- =========================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2️⃣ DOCTORS TABLE
-- =========================
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    specialization VARCHAR(100),
    available_from TIME,
    available_to TIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 3️⃣ PATIENTS TABLE
-- =========================
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT,
    gender ENUM('male','female','other'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 4️⃣ TRIAGE RESULTS (ML OUTPUT)
-- =========================
CREATE TABLE triage_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    predicted_disease VARCHAR(255),
    severity ENUM('emergency','urgent','normal') NOT NULL,
    prediction_confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- =========================
-- 5️⃣ APPOINTMENTS TABLE
-- =========================
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    triage_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending','scheduled','completed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (triage_id) REFERENCES triage_results(id)
);

-- =========================
-- 6️⃣ SYMPTOMS TABLE
-- =========================
CREATE TABLE symptoms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- =========================
-- 7️⃣ PATIENT SYMPTOMS (BRIDGE TABLE)
-- =========================
CREATE TABLE patient_symptoms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    symptom_id INT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
);