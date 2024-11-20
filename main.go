package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"rbs2/config"
	"rbs2/workWithFiles"
	"syscall"
	"time"
)

// handler - функция обработки запросов
func handler(w http.ResponseWriter, r *http.Request) {
	dir := r.URL.Query().Get("dir")
	order := r.URL.Query().Get("order")
	timer := time.Now()
	if dir == "" {
		http.Error(w, "Директория не задана", http.StatusBadRequest)
		return
	}

	if order == "" {
		order = "asc"
	}

	if order != "asc" && order != "desc" {
		http.Error(w, "Неверный параметр order. Используйте 'asc' или 'desc'", http.StatusBadRequest)
		return
	}

	files, size, err := workWithFiles.GetFiles(dir, order, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)

	go func() {
		err = sendDirToApache(dir, size, time.Since(timer))
		if err != nil {
			fmt.Println(err)
		}
	}()
}

// sendDirToApache - отправляет dir на Apache сервер для PHP страницы
func sendDirToApache(dir string, size int, time time.Duration) error {
	phpURL, err := config.DefPhpUrl()
	if err != nil {
		return fmt.Errorf("ошибка загрузки config файла: %s", err)
	}
	sizeInt, sizeStr := workWithFiles.FormatSize(float64(size))
	stringSize := fmt.Sprint(sizeInt, sizeStr)

	data := workWithFiles.Result{
		Path: dir,
		Size: stringSize,
		Time: time.String(),
	}

	fmt.Println(data)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("ошибка при маршаллинге данных: %v", err)
	}

	resp, err := http.Post(phpURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("ошибка при отправке данных на PHP: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("ошибка при чтении ответа от PHP: %v", err)
	}

	if resp.StatusCode == http.StatusOK {
		fmt.Println("JSON получен:", resp.Status)
		fmt.Println("Ответ от сервера:", string(body))
	} else {
		return fmt.Errorf("сервер вернул ошибку: %d %s. Ответ: %s", resp.StatusCode, resp.Status, string(body))
	}

	return nil
}

// setupHandlers - Функция для настройки маршрутизатора
func setupHandlers() http.Handler {
	hand := http.NewServeMux()
	hand.Handle("/", http.FileServer(http.Dir("./frontend/dist")))
	hand.HandleFunc("/files", handler)
	return hand
}

func main() {
	portFlag := flag.String("port", "", "Порт для запуска сервера (должен быть 4-значным, состоящим из цифр). Был использован порт из config файла")
	flag.Parse()

	port, err := config.DefPort(*portFlag)
	if err != nil {
		fmt.Println("Ошибка загрузки config файла:", err)
		return
	}
	server := &http.Server{Addr: ":" + port, Handler: setupHandlers()}

	exit := make(chan os.Signal, 1)
	signal.Notify(exit, os.Interrupt, syscall.SIGTERM)

	exitChan := make(chan struct{})

	go func() {
		<-exit
		log.Println("Получен сигнал завершения, останавливаю сервер...")
		if err := server.Close(); err != nil {
			log.Fatal("Ошибка при остановке сервера:", err)
		}
		close(exitChan)
	}()

	go func() {
		reader := bufio.NewReader(os.Stdin)
		for {
			text, _ := reader.ReadString('\n')
			if text == "exit\n" {
				if err := server.Close(); err != nil {
					log.Fatal("Ошибка при остановке сервера: ", err)
				}
				close(exitChan)
				break
			}
		}
	}()

	log.Printf("Сервер запущен на http://localhost:%s", port)

	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatal("Ошибка запуска сервера:", err)
	}

	<-exitChan
	log.Println("Сервер завершил работу.")

}
