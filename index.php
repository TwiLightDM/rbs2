<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

$host = 'localhost';
$dbname = 'data';
$username = 'user';
$password = 'Password_1';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, path, size, time, date FROM response";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);  
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);

    if (isset($data['path']) && isset($data['size']) && isset($data['time'])) {
        $path = $data['path'];
        $size = $data['size'];
        $time = $data['time'];

        $sql = "INSERT INTO response (path, size, time) VALUES (:path, :size, :time)";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute([':path' => $path, ':size' => $size, ':time' => $time]);
            echo "Данные успешно добавлены в базу данных.";
        } catch (PDOException $e) {
            echo "Ошибка при добавлении данных: " . $e->getMessage();
        }
    } else {
        echo "Некорректный формат JSON или отсутствуют нужные поля.";
    }
}
?>
