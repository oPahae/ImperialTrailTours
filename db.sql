DROP DATABASE xpmaroc;
CREATE DATABASE xpmaroc;

CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    dateR DATE NOT NULL,
    contenu TEXT,
    netoiles INT CHECK (netoiles BETWEEN 1 AND 5)
);

CREATE TABLE Tours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    descr TEXT,
    codeUnique VARCHAR(50) UNIQUE NOT NULL,
    njours INT,
    img BLOB,
    places VARCHAR(255),
    type VARCHAR(50),
    daily BOOLEAN DEFAULT FALSE,
    dateStart DATETIME DEFAULT NULL,
    minSpots INT DEFAULT 0,
    maxSpots INT DEFAULT NULL,
    price INT DEFAULT NULL
);

CREATE TABLE ReviewsTour (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    dateR DATE NOT NULL,
    contenu TEXT,
    netoiles INT CHECK (netoiles BETWEEN 1 AND 5),
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Imgs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT NOT NULL,
    contenu BLOB,
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE
);

CREATE TABLE Jours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    descr TEXT,
    places VARCHAR(255), 
    inclus VARCHAR(255), 
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE
);

CREATE TABLE Dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT,
    dateDeb DATE NOT NULL,
    dateFin DATE NOT NULL,
    ndispo INT NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE
);

CREATE TABLE Highlights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    texte TEXT,
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE
);

CREATE TABLE Reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourID INT NOT NULL,
    dateR INT NOT NULL,
    dateReserv DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT "pending",
    userID INT DEFAULT NULL,
    paid BOOLEAN DEFAULT false,
    payment_method VARCHAR(20),
    paid_amount DECIMAL(10,2) NULL,
    currency VARCHAR(3) DEFAULT 'USD';
    img BLOB DEFAULT NULL;
    FOREIGN KEY (tourID) REFERENCES Tours(id) ON DELETE CASCADE,
    FOREIGN KEY (dateR) REFERENCES Dates(id) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(id) ON DELETE SET NULL
);

CREATE TABLE Voyageurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservID INT NOT NULL,
    prefix VARCHAR(10),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    dateN DATE,
    tel VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    nationalite VARCHAR(50),
    passport VARCHAR(50),
    passportExpir DATE,
    pays VARCHAR(50) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    adresse TEXT,
    province VARCHAR(100),
    codePostal VARCHAR(20),
    FOREIGN KEY (reservID) REFERENCES Reservations(id) ON DELETE CASCADE
);

CREATE TABLE Blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    img LONGTEXT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    dateB DATETIME NOT NULL
);

CREATE TABLE Contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    msg TEXT NOT NULL,
    dateC DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FAQs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    question TEXT NOT NULL,
    reponse TEXT NOT NULL
);

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Percent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value INT DEFAULT 20
);

INSERT INTO Percent (value) VALUES (20);



----------------------



ALTER TABLE Tours
ADD COLUMN daily BOOLEAN DEFAULT FALSE,
ADD COLUMN dateStart DATETIME DEFAULT NULL,
ADD COLUMN minSpots INT DEFAULT 0,
ADD COLUMN price INT DEFAULT NULL;

ALTER TABLE Dates
MODIFY COLUMN tourID INT NULL;



----------------------



ALTER TABLE Tours ADD COLUMN maxSpots INT DEFAULT NULL;