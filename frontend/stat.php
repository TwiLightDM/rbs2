<?php
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['dir']) && !empty($data['dir'])) {
        $dir = $data['dir'];

        $response = array(
            "status" => "success",
            "message" => "Данные для директории '$dir' успешно получены"
        );
    } else {
        $response = array(
            "status" => "error",
            "message" => "Ошибка: директория не указана"
        );
    }
    header('Content-Type: application/json');
    echo json_encode($response);
?>