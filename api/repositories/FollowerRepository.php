<?php

class FollowerRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM followers WHERE user_id=?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function findByFollower(int $followerId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM followers WHERE follower_id=?');
        $stmt->execute([$followerId]);
        return $stmt->fetchAll();
    }

    public function find(int $userId, int $followerId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM followers WHERE user_id=? AND follower_id=?');
        $stmt->execute([$userId, $followerId]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $userId, int $followerId): array
    {
        $isPrivate = $this->db->prepare('SELECT is_private FROM users WHERE id=?');
        $isPrivate->execute([$userId]);
        $user = $isPrivate->fetch();
        $status = ($user && $user['is_private']) ? 'pending' : 'accepted';

        $stmt = $this->db->prepare('INSERT INTO followers (user_id,follower_id,status) VALUES (?,?,?)');
        $stmt->execute([$userId, $followerId, $status]);

        if ($status === 'accepted') {
            $this->db->prepare('UPDATE users SET followers=followers+1 WHERE id=?')->execute([$userId]);
            $this->db->prepare('UPDATE users SET following=following+1 WHERE id=?')->execute([$followerId]);
        }

        return $this->find($userId, $followerId);
    }

    public function updateStatus(int $id, string $status): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM followers WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) return null;

        $this->db->prepare('UPDATE followers SET status=? WHERE id=?')->execute([$status, $id]);

        if ($status === 'accepted' && $row['status'] !== 'accepted') {
            $this->db->prepare('UPDATE users SET followers=followers+1 WHERE id=?')->execute([$row['user_id']]);
            $this->db->prepare('UPDATE users SET following=following+1 WHERE id=?')->execute([$row['follower_id']]);
        }

        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function delete(int $userId, int $followerId): bool
    {
        $row = $this->find($userId, $followerId);
        if (!$row) return false;
        $this->db->prepare('DELETE FROM followers WHERE user_id=? AND follower_id=?')->execute([$userId, $followerId]);
        if ($row['status'] === 'accepted') {
            $this->db->prepare('UPDATE users SET followers=GREATEST(followers-1,0) WHERE id=?')->execute([$userId]);
            $this->db->prepare('UPDATE users SET following=GREATEST(following-1,0) WHERE id=?')->execute([$followerId]);
        }
        return true;
    }
}
