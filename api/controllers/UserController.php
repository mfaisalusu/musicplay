<?php

class UserController
{
    private UserRepository $userRepo;
    public function __construct(UserRepository $userRepo) { $this->userRepo = $userRepo; }

    public function index(): void
    {
        Response::success($this->userRepo->findAll());
    }

    public function show(int $id): void
    {
        $user = $this->userRepo->findById($id);
        if (!$user) { Response::notFound('User not found'); return; }
        Response::success($user);
    }

    public function update(int $id, Request $req): void
    {
        $user = $this->userRepo->findById($id);
        if (!$user) { Response::notFound('User not found'); return; }
        Response::success($this->userRepo->update($id, $req->body));
    }

    public function destroy(int $id): void
    {
        if (!$this->userRepo->delete($id)) { Response::notFound('User not found'); return; }
        Response::success(null);
    }
}
