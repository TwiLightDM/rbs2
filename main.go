package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"rbs2/config"
	"rbs2/server"
	"syscall"
)

func main() {
	portFlag := flag.String("port", "", "Порт для запуска сервера (должен быть 4-значным, состоящим из цифр). Был использован порт из config файла")
	flag.Parse()

	port, err := config.DefPort(*portFlag)
	if err != nil {
		fmt.Println("Ошибка загрузки config файла:", err)
		return
	}
	server := &http.Server{Addr: ":" + port, Handler: server.SetupHandlers()}

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
