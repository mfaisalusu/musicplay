<?php

class FavoriteController
{
    private FavoriteRepository $favoriteRepo;
    public function __construct(FavoriteRepository $favoriteRepo) { $this->favoriteRepo = $favoriteRepo; }

    public function index(Request $req): void
    {
        if (empty($req->query['user_id'])) { Response::error('user_id is required'); return; }
        $type = $req->query['type'] ?? null;
        Response::success($this->favoriteRepo->findByUser((int)$req->query['user_id'], $type));
    }

    public function store(Request $req): void
    {
        $userId   = (int)($req->body['user_id'] ?? 0);
        $type     = $req->body['type'] ?? '';
        $targetId = (int)($req->body['target_id'] ?? 0);

        if (!$userId || !in_array($type, ['playlist', 'music']) || !$targetId) {
            Response::error('user_id, type (playlist|music), and target_id are required');
            return;
        }
        if ($this->favoriteRepo->find($userId, $type, $targetId)) { Response::error('Already favorited'); return; }
        Response::success($this->favoriteRepo->create($userId, $type, $targetId), 201);
    }

    public function destroy(Request $req): void
    {
        $userId   = (int)($req->body['user_id'] ?? 0);
        $type     = $req->body['type'] ?? '';
        $targetId = (int)($req->body['target_id'] ?? 0);

        if (!$this->favoriteRepo->delete($userId, $type, $targetId)) { Response::notFound('Favorite not found'); return; }
        Response::success(null);
    }
}
