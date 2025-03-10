CREATE DATABASE IF NOT EXISTS meditactive;

USE meditactive;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS intervals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_dates (userId, startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interval_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intervalId INT NOT NULL,
  goalId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intervalId) REFERENCES intervals(id) ON DELETE CASCADE,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_interval_goal (intervalId, goalId),
  INDEX idx_interval (intervalId),
  INDEX idx_goal (goalId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO users (email, firstName, lastName) VALUES
('mario.rossi@example.com', 'Mario', 'Rossi'),
('laura.bianchi@example.com', 'Laura', 'Bianchi');

INSERT INTO goals (name, description) VALUES
('Meditazione quotidiana', 'Pratica 15 minuti di meditazione ogni giorno'),
('Attività fisica', 'Almeno 30 minuti di esercizio fisico 3 volte a settimana'),
('Alimentazione sana', 'Ridurre il consumo di zuccheri e aumentare frutta e verdura'),
('Lettura serale', 'Leggere almeno 20 pagine prima di andare a dormire');

INSERT INTO intervals (startDate, endDate, userId) VALUES
('2023-09-01', '2023-09-30', 1),
('2023-10-01', '2023-10-31', 1),
('2023-09-15', '2023-10-15', 2);

INSERT INTO interval_goals (intervalId, goalId) VALUES
(1, 1), -- Mario Rossi - Set 2023 - Meditazione quotidiana
(1, 2), -- Mario Rossi - Set 2023 - Attività fisica
(2, 1), -- Mario Rossi - Ott 2023 - Meditazione quotidiana
(2, 3), -- Mario Rossi - Ott 2023 - Alimentazione sana
(3, 2), -- Laura Bianchi - Set/Ott 2023 - Attività fisica
(3, 4); -- Laura Bianchi - Set/Ott 2023 - Lettura serale