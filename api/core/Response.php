<?php

class Response
{
    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode(self::toCamel($data));
        exit;
    }

    public static function success($data, int $status = 200): void
    {
        self::json(['success' => true, 'data' => $data], $status);
    }

    private static function toCamel($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $newKey = is_string($key) ? lcfirst(str_replace('_', '', ucwords($key, '_'))) : $key;
                $result[$newKey] = self::toCamel($value);
            }
            return $result;
        }
        return $data;
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['success' => false, 'message' => $message], $status);
    }

    public static function notFound(string $message = 'Not found'): void
    {
        self::error($message, 404);
    }
}
