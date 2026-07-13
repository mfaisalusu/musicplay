<?php

class MusicController
{
    private MusicRepository $musicRepo;
    public function __construct(MusicRepository $musicRepo) { $this->musicRepo = $musicRepo; }

    public function index(Request $req): void
    {
        $playlistId = isset($req->query['playlist_id']) ? (int)$req->query['playlist_id'] : null;
        Response::success($this->musicRepo->findAll($playlistId));
    }

    public function checkDuplicate(Request $req): void
    {
        $playlistId = isset($req->query['playlist_id']) ? (int)$req->query['playlist_id'] : 0;
        $url = isset($req->query['url']) ? trim($req->query['url']) : '';
        if (!$playlistId || !$url) { Response::error('playlist_id and url are required'); return; }
        $existing = $this->musicRepo->findByUrl($playlistId, $url);
        Response::success(['exists' => $existing !== null, 'music' => $existing]);
    }

    public function show(int $id): void
    {
        $music = $this->musicRepo->findById($id);
        if (!$music) { Response::notFound('Music not found'); return; }
        Response::success($music);
    }

    public function store(Request $req): void
    {
        $required = ['playlist_id', 'platform', 'url', 'title'];
        foreach ($required as $field) {
            if (empty($req->body[$field])) {
                Response::error("$field is required");
                return;
            }
        }
        Response::success($this->musicRepo->create($req->body), 201);
    }

    public function update(int $id, Request $req): void
    {
        if (!$this->musicRepo->findById($id)) { Response::notFound('Music not found'); return; }
        Response::success($this->musicRepo->update($id, $req->body));
    }

    public function destroy(int $id): void
    {
        if (!$this->musicRepo->delete($id)) { Response::notFound('Music not found'); return; }
        Response::success(null);
    }
}
