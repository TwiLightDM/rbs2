<?php
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(["message" => "Ошибка: некорректный JSON"]);
        exit;
    }

    if (isset($data['Path'], $data['Size'], $data['Time'])) {
        $path = $data['Path'];
        $size = $data['Size'];
        $time = $data['Time'];
        
        echo json_encode(["message" => "Файл получен", "path" => $path, "size" => $size, "time" => $time]);
    }
?>