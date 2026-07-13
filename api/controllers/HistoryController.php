<?php

class HistoryController
{
    private HistoryRepository $historyRepo;
    public function __construct(HistoryRepository $historyRepo) { $this->historyRepo = $historyRepo; }

    public function index(Request $req): void
    {
        if (empty($req->query['user_id'])) { Response::error('user_id is required'); return; }
        Response::success($this->historyRepo->findByUser((int)$req->query['user_id']));
    }

    public function store(Request $req): void
    {
        $userId     = (int)($req->body['user_id'] ?? 0);
        $musicId    = (int)($req->body['music_id'] ?? 0);
        $playlistId = (int)($req->body['playlist_id'] ?? 0);

        if (!$userId || !$musicId || !$playlistId) {
            Response::error('user_id, music_id, and playlist_id are required');
            return;
        }
        Response::success($this->historyRepo->create($userId, $musicId, $playlistId), 201);
    }

    public function destroy(Request $req): void
    {
        if (empty($req->query['user_id'])) { Response::error('user_id is required'); return; }
        $this->historyRepo->deleteByUser((int)$req->query['user_id']);
        Response::success(null);
    }
}
