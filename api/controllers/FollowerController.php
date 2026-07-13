<?php

class FollowerController
{
    private FollowerRepository $followerRepo;
    public function __construct(FollowerRepository $followerRepo) { $this->followerRepo = $followerRepo; }

    public function index(Request $req): void
    {
        if (!empty($req->query['user_id'])) {
            Response::success($this->followerRepo->findByUser((int)$req->query['user_id']));
        } elseif (!empty($req->query['follower_id'])) {
            Response::success($this->followerRepo->findByFollower((int)$req->query['follower_id']));
        } else {
            Response::error('user_id or follower_id query param required');
        }
    }

    public function store(Request $req): void
    {
        $userId     = (int)($req->body['user_id'] ?? 0);
        $followerId = (int)($req->body['follower_id'] ?? 0);
        if (!$userId || !$followerId) { Response::error('user_id and follower_id are required'); return; }
        if ($this->followerRepo->find($userId, $followerId)) { Response::error('Already following'); return; }
        Response::success($this->followerRepo->create($userId, $followerId), 201);
    }

    public function updateStatus(int $id, Request $req): void
    {
        $status = $req->body['status'] ?? '';
        if (!in_array($status, ['accepted', 'rejected'])) { Response::error('Invalid status'); return; }
        $result = $this->followerRepo->updateStatus($id, $status);
        if (!$result) { Response::notFound('Follow request not found'); return; }
        Response::success($result);
    }

    public function destroy(Request $req): void
    {
        $userId     = (int)($req->body['user_id'] ?? 0);
        $followerId = (int)($req->body['follower_id'] ?? 0);
        if (!$userId || !$followerId) { Response::error('user_id and follower_id are required'); return; }
        if (!$this->followerRepo->delete($userId, $followerId)) { Response::notFound('Follow not found'); return; }
        Response::success(null);
    }
}
