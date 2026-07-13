<?php

class AuthController
{
    private UserRepository $userRepo;
    public function __construct(UserRepository $userRepo) { $this->userRepo = $userRepo; }

    public function login(Request $req): void
    {
        $email    = $req->body['email'] ?? '';
        $password = $req->body['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Email and password are required');
            return;
        }

        $user = $this->userRepo->findByEmail($email);
        if (!$user || !password_verify($password, $user['password'])) {
            Response::error('Invalid email or password', 401);
            return;
        }

        unset($user['password']);
        Response::success([
            'userId'   => $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
            'avatar'   => $user['avatar'],
        ]);
    }

    public function register(Request $req): void
    {
        $username = $req->body['username'] ?? '';
        $email    = $req->body['email'] ?? '';
        $password = $req->body['password'] ?? '';

        if (!$username || !$email || !$password) {
            Response::error('Username, email, and password are required');
            return;
        }

        if ($this->userRepo->findByEmail($email)) {
            Response::error('Email already in use');
            return;
        }

        $user = $this->userRepo->create(['username' => $username, 'email' => $email, 'password' => $password]);
        unset($user['password']);
        Response::success($user, 201);
    }
}
