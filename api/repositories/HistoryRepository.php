<?php

class HistoryRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT h.*,m.title,m.thumbnail,m.platform,m.duration,p.title AS playlist_title
             FROM history h
             JOIN musics m ON h.music_id=m.id
             JOIN playlists p ON h.playlist_id=p.id
             WHERE h.user_id=? ORDER BY h.played_at DESC LIMIT 50'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function create(int $userId, int $musicId, int $playlistId): array
    {
        $stmt = $this->db->prepare('INSERT INTO history (user_id,music_id,playlist_id,played_at) VALUES (?,?,?,NOW())');
        $stmt->execute([$userId, $musicId, $playlistId]);
        $id = (int)$this->db->lastInsertId();
        $row = $this->db->prepare('SELECT * FROM history WHERE id=?');
        $row->execute([$id]);
        return $row->fetch();
    }

    public function deleteByUser(int $userId): bool
    {
        return (bool)$this->db->prepare('DELETE FROM history WHERE user_id=?')->execute([$userId]);
    }
}
