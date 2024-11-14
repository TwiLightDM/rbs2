package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"strconv"
	"sync"
	"syscall"
	"time"
	"unicode/utf8"
)

// getFiles - функция для получения информации о файлах в директории.
func getFiles(dir string, order string, w http.ResponseWriter) ([]fileInfo, int, error) {
	var files []fileInfo

	err := walkDir(dir, &files)
	if err != nil {
		fmt.Println("Ошибка получения размера папки: ", dir, err)
		http.Error(w, "Директория не существует", http.StatusBadRequest)
	}

	if order == "asc" {
		sort.Slice(files, func(i, j int) bool {
			return files[i].Size < files[j].Size
		})
	} else {
		sort.Slice(files, func(i, j int) bool {
			return files[i].Size > files[j].Size
		})
	}
	var fullSize int
	for i := 0; i < len(files); i++ {
		fullSize += int(files[i].Size)
		size, format := formatSize(files[i].Size)
		files[i].Size = size
		files[i].Format = format
	}

	return files, fullSize, nil
}

// walkDir - рекурсивная функция для обхода директории
func walkDir(dir string, files *[]fileInfo) error {

	entries, err := os.ReadDir(dir)
	if err != nil {
		fmt.Println("Ошибка при чтении директории: ", dir)
		return err
	}

	var wg sync.WaitGroup

	for _, entry := range entries {
		fullPath := filepath.Join(dir, entry.Name())

		wg.Add(1)
		go func(entry os.DirEntry, path string) {
			defer wg.Done()

			if entry.IsDir() {
				folderSize, err := getFolderSize(path)
				if err != nil {
					return
				}
				*files = append(*files, fileInfo{entry.Name(), float64(folderSize), "b", true})
			} else {
				information, err := entry.Info()
				if err != nil {
					fmt.Println("Ошибка получения информации о файле ", entry.Name())
					return
				}
				*files = append(*files, fileInfo{information.Name(), float64(information.Size()), "b", false})
			}
		}(entry, fullPath)
	}

	wg.Wait()
	return nil
}

// getFolderSize - функция для получения общего размера папки и её содержимого
func getFolderSize(folderPath string) (int64, error) {
	var size int64

	err := filepath.Walk(folderPath, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Println("Ошибка при обходе папки ", folderPath)
			return err
		}
		size += info.Size()
		return nil
	})

	if err != nil {
		fmt.Println("Ошибка при расчете размера папки ", folderPath)
		return 0, err
	}

	return size, nil
}

// formatSize - функция, для форматирование размера файла + возврат названия размера файла
func formatSize(size float64) (float64, string) {
	const (
		kb = 1 << 10
		mb = 1 << 20
		gb = 1 << 30
		tb = 1 << 40
	)

	switch {
	case size < kb:
		return float64(size), "b"

	case size < mb:
		sizeStr := fmt.Sprintf("%.1f", float64(size)/float64(kb))
		if value, err := strconv.ParseFloat(sizeStr, 64); err == nil {
			return value, "Kb"
		} else {
			return 0, ""
		}

	case size < gb:
		sizeStr := fmt.Sprintf("%.1f", float64(size)/float64(mb))
		if value, err := strconv.ParseFloat(sizeStr, 64); err == nil {
			return value, "Mb"
		} else {
			return 0, ""
		}

	case size < tb:
		sizeStr := fmt.Sprintf("%.1f", float64(size)/float64(gb))
		if value, err := strconv.ParseFloat(sizeStr, 64); err == nil {
			return value, "Gb"
		} else {
			return 0, ""
		}

	default:
		sizeStr := fmt.Sprintf("%.1f", float64(size)/float64(tb))
		if value, err := strconv.ParseFloat(sizeStr, 64); err == nil {
			return value, "Tb"
		} else {
			return 0, ""
		}
	}
}

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

	files, size, err := getFiles(dir, order, w)
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

func defPhpUrl() (string, error) {
	config, err := loadConfig()
	if err != nil {
		return "", err
	}

	phpUrl := config.PhpURL
	return phpUrl, nil
}

// sendDirToApache - отправляет dir на Apache сервер для PHP страницы
func sendDirToApache(dir string, size int, time time.Duration) error {
	phpURL, err := defPhpUrl()
	if err != nil {
		return fmt.Errorf("ошибка загрузки config файла: %s", err)
	}
	sizeInt, sizeStr := formatSize(float64(size))
	stringSize := fmt.Sprint(sizeInt, sizeStr)

	data := result{
		Path: dir,
		Size: stringSize,
		Time: time,
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

	if resp.StatusCode == http.StatusOK {
		fmt.Println("json получен", resp.Status)
	} else {
		return fmt.Errorf("сервер вернул ошибку: %d %s", resp.StatusCode, resp.Status)
	}

	return nil
}

// loadConfig - функция, для взятие информации из файла конфига
func loadConfig() (*config, error) {
	file, err := os.Open("config.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	config := &config{}
	err = json.NewDecoder(file).Decode(config)
	if err != nil {
		return nil, err
	}

	return config, nil
}

// defPort - Функция для определения порта
func defPort(port string) (string, error) {
	if utf8.RuneCountInString(port) == 4 {
		_, err := strconv.Atoi(port)
		if err == nil {
			return port, nil
		}
	}
	if port != "" {
		flag.Usage()
	}
	fmt.Println(port)
	config, err := loadConfig()
	if err != nil {
		return "", err
	}

	port = config.Port
	return port, nil
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

	port, err := defPort(*portFlag)
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
			log.Print("Введите 'exit' для завершения: ")
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
