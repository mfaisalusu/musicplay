<?php

class UserRepository
{
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function findAll(): array
    {
        return $this->db->query('SELECT id,username,email,avatar,bio,is_private,followers,following,playlist_count,music_count,created_at FROM users')->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT id,username,email,avatar,bio,is_private,followers,following,playlist_count,music_count,created_at FROM users WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email=?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO users (username,email,password,avatar,bio,is_private,created_at) VALUES (?,?,?,?,?,?,NOW())');
        $stmt->execute([$data['username'], $data['email'], password_hash($data['password'], PASSWORD_BCRYPT), isset($data['avatar']) ? $data['avatar'] : '', isset($data['bio']) ? $data['bio'] : '', isset($data['is_private']) ? $data['is_private'] : 0]);
        return $this->findById((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $values = [];
        $allowed = ['username', 'avatar', 'bio', 'is_private'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field=?";
                $values[] = $data[$field];
            }
        }
        if (empty($fields)) return $this->findById($id);
        $values[] = $id;
        $this->db->prepare('UPDATE users SET ' . implode(',', $fields) . ' WHERE id=?')->execute($values);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        return (bool)$this->db->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
    }
}
