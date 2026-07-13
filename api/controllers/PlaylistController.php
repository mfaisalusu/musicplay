<?php

class PlaylistController
{
    private PlaylistRepository $playlistRepo;
    public function __construct(PlaylistRepository $playlistRepo) { $this->playlistRepo = $playlistRepo; }

    public function index(Request $req): void
    {
        $userId = isset($req->query['user_id']) ? (int)$req->query['user_id'] : null;
        Response::success($this->playlistRepo->findAll($userId));
    }

    public function show(int $id): void
    {
        $playlist = $this->playlistRepo->findById($id);
        if (!$playlist) { Response::notFound('Playlist not found'); return; }
        Response::success($playlist);
    }

    public function store(Request $req): void
    {
        if (empty($req->body['user_id']) || empty($req->body['title'])) {
            Response::error('user_id and title are required');
            return;
        }
        Response::success($this->playlistRepo->create($req->body), 201);
    }

    public function update(int $id, Request $req): void
    {
        if (!$this->playlistRepo->findById($id)) { Response::notFound('Playlist not found'); return; }
        Response::success($this->playlistRepo->update($id, $req->body));
    }

    public function destroy(int $id): void
    {
        if (!$this->playlistRepo->delete($id)) { Response::notFound('Playlist not found'); return; }
        Response::success(null);
    }
}
