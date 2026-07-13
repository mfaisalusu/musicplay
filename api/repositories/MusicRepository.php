<?php

class MusicRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findByUrl(int $playlistId, string $url): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM musics WHERE playlist_id=? AND url=?');
        $stmt->execute([$playlistId, $url]);
        return $stmt->fetch() ?: null;
    }

    public function findAll(?int $playlistId = null): array
    {
        if ($playlistId !== null) {
            $stmt = $this->db->prepare('SELECT * FROM musics WHERE playlist_id=? ORDER BY `order` ASC');
            $stmt->execute([$playlistId]);
            return $stmt->fetchAll();
        }
        return $this->db->query('SELECT * FROM musics ORDER BY `order` ASC')->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM musics WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO musics (playlist_id,platform,url,title,thumbnail,duration,`order`,created_at) VALUES (?,?,?,?,?,?,?,NOW())');
        $stmt->execute([$data['playlist_id'], $data['platform'], $data['url'], $data['title'], isset($data['thumbnail']) ? $data['thumbnail'] : '', isset($data['duration']) ? $data['duration'] : '', isset($data['order']) ? $data['order'] : 0]);
        $id = (int)$this->db->lastInsertId();
        $playlist = $this->db->prepare('SELECT user_id FROM playlists WHERE id=?');
        $playlist->execute([$data['playlist_id']]);
        $row = $playlist->fetch();
        if ($row) {
            $this->db->prepare('UPDATE users SET music_count=music_count+1 WHERE id=?')->execute([$row['user_id']]);
        }
        return $this->findById($id);
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $values = [];
        foreach (['platform', 'url', 'title', 'thumbnail', 'duration', 'order'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = ($field === 'order' ? '`order`' : $field) . '=?';
                $values[] = $data[$field];
            }
        }
        if (empty($fields)) return $this->findById($id);
        $values[] = $id;
        $this->db->prepare('UPDATE musics SET ' . implode(',', $fields) . ' WHERE id=?')->execute($values);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $music = $this->findById($id);
        if (!$music) return false;
        $this->db->prepare('DELETE FROM musics WHERE id=?')->execute([$id]);
        $playlist = $this->db->prepare('SELECT user_id FROM playlists WHERE id=?');
        $playlist->execute([$music['playlist_id']]);
        $row = $playlist->fetch();
        if ($row) {
            $this->db->prepare('UPDATE users SET music_count=GREATEST(music_count-1,0) WHERE id=?')->execute([$row['user_id']]);
        }
        return true;
    }
}
