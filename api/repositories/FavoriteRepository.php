<?php

class FavoriteRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findByUser(int $userId, ?string $type = null): array
    {
        if ($type) {
            $stmt = $this->db->prepare('SELECT * FROM favorites WHERE user_id=? AND type=? ORDER BY created_at DESC');
            $stmt->execute([$userId, $type]);
        } else {
            $stmt = $this->db->prepare('SELECT * FROM favorites WHERE user_id=? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
        }
        return $stmt->fetchAll();
    }

    public function find(int $userId, string $type, int $targetId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM favorites WHERE user_id=? AND type=? AND target_id=?');
        $stmt->execute([$userId, $type, $targetId]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $userId, string $type, int $targetId): array
    {
        $stmt = $this->db->prepare('INSERT INTO favorites (user_id,type,target_id,created_at) VALUES (?,?,?,NOW())');
        $stmt->execute([$userId, $type, $targetId]);
        return $this->find($userId, $type, $targetId);
    }

    public function delete(int $userId, string $type, int $targetId): bool
    {
        return (bool)$this->db->prepare('DELETE FROM favorites WHERE user_id=? AND type=? AND target_id=?')->execute([$userId, $type, $targetId]);
    }
}
