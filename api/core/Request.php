<?php

class Request
{
    public $method;
    public $path;
    public $body;
    public $query;
    public $segments;

    public function __construct()
    {
        $this->method   = $_SERVER['REQUEST_METHOD'];
        $this->query    = $_GET;
        $decoded        = json_decode(file_get_contents('php://input'), true);
        $this->body     = $decoded !== null ? $decoded : [];
        $uri            = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $base           = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        $path           = '/' . trim(substr($uri, strlen($base)), '/');
        $segments       = array_values(array_filter(explode('/', $path)));
        // Strip 'api' prefix jika ada (misal URL: /api/auth/login)
        if (isset($segments[0]) && $segments[0] === 'api') {
            array_shift($segments);
        }
        $this->path     = '/' . implode('/', $segments);
        $this->segments = $segments;
    }

    public function segment(int $index): ?string
    {
        return isset($this->segments[$index]) ? $this->segments[$index] : null;
    }
}
