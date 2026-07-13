<?php

class PlaylistRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findAll(?int $userId = null): array
    {
        if ($userId !== null) {
            $stmt = $this->db->prepare('SELECT * FROM playlists WHERE user_id=? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
            return $stmt->fetchAll();
        }
        return $this->db->query('SELECT * FROM playlists ORDER BY created_at DESC')->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM playlists WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO playlists (user_id,title,description,cover,created_at) VALUES (?,?,?,?,NOW())');
        $stmt->execute([$data['user_id'], $data['title'], isset($data['description']) ? $data['description'] : '', isset($data['cover']) ? $data['cover'] : '']);
        $id = (int)$this->db->lastInsertId();
        $this->db->prepare('UPDATE users SET playlist_count=playlist_count+1 WHERE id=?')->execute([$data['user_id']]);
        return $this->findById($id);
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $values = [];
        foreach (['title', 'description', 'cover'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field=?";
                $values[] = $data[$field];
            }
        }
        if (empty($fields)) return $this->findById($id);
        $values[] = $id;
        $this->db->prepare('UPDATE playlists SET ' . implode(',', $fields) . ' WHERE id=?')->execute($values);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $playlist = $this->findById($id);
        if (!$playlist) return false;
        $this->db->prepare('DELETE FROM playlists WHERE id=?')->execute([$id]);
        $this->db->prepare('UPDATE users SET playlist_count=GREATEST(playlist_count-1,0) WHERE id=?')->execute([$playlist['user_id']]);
        return true;
    }
}
