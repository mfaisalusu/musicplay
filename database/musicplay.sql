-- ============================================================
-- MusicPlay Database
-- Compatible: MySQL 5.7+ / MariaDB 10.3+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `devindon_music`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `devindon_music`;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)     NOT NULL,
  `email`         VARCHAR(100)    NOT NULL,
  `password`      VARCHAR(255)    NOT NULL,
  `avatar`        TEXT            DEFAULT NULL,
  `bio`           TEXT            DEFAULT NULL,
  `is_private`    TINYINT(1)      NOT NULL DEFAULT 0,
  `followers`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `following`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `playlist_count` INT UNSIGNED   NOT NULL DEFAULT 0,
  `music_count`   INT UNSIGNED    NOT NULL DEFAULT 0,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: playlists
-- ------------------------------------------------------------
CREATE TABLE `playlists` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NOT NULL,
  `title`       VARCHAR(100)  NOT NULL,
  `description` TEXT          DEFAULT NULL,
  `cover`       TEXT          DEFAULT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_playlists_user_id` (`user_id`),
  CONSTRAINT `fk_playlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: musics
-- ------------------------------------------------------------
CREATE TABLE `musics` (
  `id`          INT UNSIGNED                          NOT NULL AUTO_INCREMENT,
  `playlist_id` INT UNSIGNED                          NOT NULL,
  `platform`    ENUM('youtube','spotify','soundcloud') NOT NULL,
  `url`         TEXT                                  NOT NULL,
  `title`       VARCHAR(255)                          NOT NULL,
  `thumbnail`   TEXT                                  DEFAULT NULL,
  `duration`    VARCHAR(10)                           DEFAULT NULL,
  `order`       INT UNSIGNED                          NOT NULL DEFAULT 0,
  `created_at`  DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_musics_playlist_id` (`playlist_id`),
  CONSTRAINT `fk_musics_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: followers
-- ------------------------------------------------------------
CREATE TABLE `followers` (
  `id`          INT UNSIGNED                          NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED                          NOT NULL,
  `follower_id` INT UNSIGNED                          NOT NULL,
  `status`      ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_followers` (`user_id`, `follower_id`),
  KEY `idx_followers_follower_id` (`follower_id`),
  CONSTRAINT `fk_followers_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followers_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: favorites
-- ------------------------------------------------------------
CREATE TABLE `favorites` (
  `id`         INT UNSIGNED             NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED             NOT NULL,
  `type`       ENUM('playlist','music') NOT NULL,
  `target_id`  INT UNSIGNED             NOT NULL,
  `created_at` DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorites` (`user_id`, `type`, `target_id`),
  KEY `idx_favorites_user_id` (`user_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: history
-- ------------------------------------------------------------
CREATE TABLE `history` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NOT NULL,
  `music_id`    INT UNSIGNED NOT NULL,
  `playlist_id` INT UNSIGNED NOT NULL,
  `played_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_history_user_id` (`user_id`),
  KEY `idx_history_music_id` (`music_id`),
  CONSTRAINT `fk_history_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_music`    FOREIGN KEY (`music_id`)    REFERENCES `musics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `bio`, `is_private`, `followers`, `following`, `playlist_count`, `music_count`, `created_at`) VALUES
(1, 'johndoe',     'john@example.com',    'password123', NULL, 'Music lover & playlist curator 🎵', 0, 2, 1, 2, 4, '2024-01-15 10:00:00'),
(2, 'janesmith',   'jane@example.com',    'password123', NULL, 'Indie & alternative music fan 🎸',  0, 1, 2, 1, 2, '2024-02-10 08:30:00'),
(3, 'privateuser', 'private@example.com', 'password123', NULL, 'I keep my music private 🔒',        1, 0, 0, 1, 2, '2024-03-01 12:00:00');

INSERT INTO `playlists` (`id`, `user_id`, `title`, `description`, `cover`, `created_at`) VALUES
(1, 1, 'Chill Vibes',    'Perfect for relaxing and unwinding', NULL, '2024-01-20 10:00:00'),
(2, 1, 'Workout Beats',  'High energy tracks for the gym',     NULL, '2024-02-01 09:00:00'),
(3, 2, 'Indie Favorites','Best indie tracks of all time',      NULL, '2024-02-15 14:00:00'),
(4, 3, 'Secret Playlist','Private collection',                 NULL, '2024-03-05 11:00:00');

INSERT INTO `musics` (`id`, `playlist_id`, `platform`, `url`, `title`, `thumbnail`, `duration`, `order`, `created_at`) VALUES
(1, 1, 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Rick Astley - Never Gonna Give You Up', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '3:33', 0, '2024-01-21 10:00:00'),
(2, 1, 'youtube', 'https://www.youtube.com/watch?v=9bZkp7q19f0', 'PSY - GANGNAM STYLE',                  'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg', '4:13', 1, '2024-01-22 10:00:00'),
(3, 2, 'youtube', 'https://www.youtube.com/watch?v=btPJPFnesV4', 'Eye of the Tiger - Survivor',          'https://img.youtube.com/vi/btPJPFnesV4/mqdefault.jpg', '4:05', 0, '2024-02-02 09:00:00'),
(4, 2, 'youtube', 'https://www.youtube.com/watch?v=ZSM3w1v-A_Y', 'Eminem - Lose Yourself',              'https://img.youtube.com/vi/ZSM3w1v-A_Y/mqdefault.jpg', '5:26', 1, '2024-02-03 09:00:00'),
(5, 3, 'youtube', 'https://www.youtube.com/watch?v=u9Dg-g7t2l4', 'Arctic Monkeys - Do I Wanna Know?',   'https://img.youtube.com/vi/u9Dg-g7t2l4/mqdefault.jpg', '4:32', 0, '2024-02-16 14:00:00'),
(6, 3, 'youtube', 'https://www.youtube.com/watch?v=bpOSxM0rNPM', 'The Killers - Mr. Brightside',        'https://img.youtube.com/vi/bpOSxM0rNPM/mqdefault.jpg', '3:42', 1, '2024-02-17 14:00:00'),
(7, 4, 'youtube', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 'Linkin Park - Numb',                  'https://img.youtube.com/vi/kXYiU_JCYtU/mqdefault.jpg', '3:05', 0, '2024-03-06 11:00:00'),
(8, 4, 'youtube', 'https://www.youtube.com/watch?v=eVTXPUF4Oz4', 'Linkin Park - In The End',            'https://img.youtube.com/vi/eVTXPUF4Oz4/mqdefault.jpg', '3:36', 1, '2024-03-07 11:00:00');

INSERT INTO `followers` (`id`, `user_id`, `follower_id`, `status`) VALUES
(1, 1, 2, 'accepted'),
(2, 2, 1, 'accepted'),
(3, 1, 3, 'pending');
