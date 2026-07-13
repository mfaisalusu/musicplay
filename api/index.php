<?php

// CORS harus dikirim PERTAMA sebelum output apapun
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/repositories/UserRepository.php';
require_once __DIR__ . '/repositories/PlaylistRepository.php';
require_once __DIR__ . '/repositories/MusicRepository.php';
require_once __DIR__ . '/repositories/FollowerRepository.php';
require_once __DIR__ . '/repositories/FavoriteRepository.php';
require_once __DIR__ . '/repositories/HistoryRepository.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/PlaylistController.php';
require_once __DIR__ . '/controllers/MusicController.php';
require_once __DIR__ . '/controllers/FollowerController.php';
require_once __DIR__ . '/controllers/FavoriteController.php';
require_once __DIR__ . '/controllers/HistoryController.php';

// Tangkap koneksi DB lebih awal agar error tidak memotong response
try {
    $db = Database::getInstance();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    $req      = new Request();
    $resource = $req->segment(0);
    $seg1     = $req->segment(1);
    $id       = ($seg1 !== null && is_numeric($seg1)) ? (int)$seg1 : null;
    $method   = $req->method;

    if ($resource === 'auth') {
        $ctrl   = new AuthController(new UserRepository($db));
        $action = $req->segment(1);
        if ($action === 'login') {
            $ctrl->login($req);
        } elseif ($action === 'register') {
            $ctrl->register($req);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'users') {
        $ctrl = new UserController(new UserRepository($db));
        if ($id === null && $method === 'GET') {
            $ctrl->index();
        } elseif ($id !== null && $method === 'GET') {
            $ctrl->show($id);
        } elseif ($id !== null && ($method === 'PUT' || $method === 'PATCH')) {
            $ctrl->update($id, $req);
        } elseif ($id !== null && $method === 'DELETE') {
            $ctrl->destroy($id);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'playlists') {
        $ctrl = new PlaylistController(new PlaylistRepository($db));
        if ($id === null && $method === 'GET') {
            $ctrl->index($req);
        } elseif ($id === null && $method === 'POST') {
            $ctrl->store($req);
        } elseif ($id !== null && $method === 'GET') {
            $ctrl->show($id);
        } elseif ($id !== null && ($method === 'PUT' || $method === 'PATCH')) {
            $ctrl->update($id, $req);
        } elseif ($id !== null && $method === 'DELETE') {
            $ctrl->destroy($id);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'musics') {
        $ctrl = new MusicController(new MusicRepository($db));
        $sub = $req->segment(1);
        if ($sub === 'check' && $method === 'GET') {
            $ctrl->checkDuplicate($req);
        } elseif ($id === null && $method === 'GET') {
            $ctrl->index($req);
        } elseif ($id === null && $method === 'POST') {
            $ctrl->store($req);
        } elseif ($id !== null && $method === 'GET') {
            $ctrl->show($id);
        } elseif ($id !== null && ($method === 'PUT' || $method === 'PATCH')) {
            $ctrl->update($id, $req);
        } elseif ($id !== null && $method === 'DELETE') {
            $ctrl->destroy($id);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'followers') {
        $ctrl = new FollowerController(new FollowerRepository($db));
        if ($id === null && $method === 'GET') {
            $ctrl->index($req);
        } elseif ($id === null && $method === 'POST') {
            $ctrl->store($req);
        } elseif ($id !== null && ($method === 'PUT' || $method === 'PATCH')) {
            $ctrl->updateStatus($id, $req);
        } elseif ($id === null && $method === 'DELETE') {
            $ctrl->destroy($req);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'favorites') {
        $ctrl = new FavoriteController(new FavoriteRepository($db));
        if ($method === 'GET') {
            $ctrl->index($req);
        } elseif ($method === 'POST') {
            $ctrl->store($req);
        } elseif ($method === 'DELETE') {
            $ctrl->destroy($req);
        } else {
            Response::notFound();
        }

    } elseif ($resource === 'history') {
        $ctrl = new HistoryController(new HistoryRepository($db));
        if ($method === 'GET') {
            $ctrl->index($req);
        } elseif ($method === 'POST') {
            $ctrl->store($req);
        } elseif ($method === 'DELETE') {
            $ctrl->destroy($req);
        } else {
            Response::notFound();
        }

    } else {
        Response::notFound('Endpoint not found');
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}
