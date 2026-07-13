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
