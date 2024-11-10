package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"sync"
	"unicode/utf8"
)

// getFiles - функция для получения информации о файлах в директории.
func getFiles(dir string, order string, w http.ResponseWriter) ([]info, error) {
	var files []info

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

	for i := 0; i < len(files); i++ {
		size, format := formatSize(files[i].Size)
		files[i].Size = size
		files[i].Format = format
	}

	return files, nil
}

// walkDir - рекурсивная функция для обхода директории
func walkDir(dir string, files *[]info) error {

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
				*files = append(*files, info{entry.Name(), float64(folderSize), "b", true})
			} else {
				information, err := entry.Info()
				if err != nil {
					fmt.Println("Ошибка получения информации о файле ", entry.Name())
					return
				}
				*files = append(*files, info{information.Name(), float64(information.Size()), "b", false})
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

	files, err := getFiles(dir, order, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// loadConfig - функция, для взятие информации из файла конфига
func loadConfig() (*Config, error) {
	file, err := os.Open("frontend/config.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	config := &Config{}
	err = json.NewDecoder(file).Decode(config)
	if err != nil {
		return nil, err
	}

	return config, nil
}

// checkPort - Функция для провки порта, введеного пользователем
func checkPort(port string) error {
	if utf8.RuneCountInString(port) != 4 {
		return errors.New("")
	}

	_, err := strconv.Atoi(port)
	if err != nil {
		return errors.New("")
	}
	return nil
}

func main() {
	portFlag := flag.String("port", "", "Порт для запуска сервера (должен быть 4-значным, состоящим из цифр). Был использован порт из config файла")
	flag.Parse()

	var port string

	if checkPort(*portFlag) != nil {
		flag.Usage()
		config, err := loadConfig()
		if err != nil {
			log.Fatal("Ошибка при загрузке файла конфигурации: ", err)
		}
		port = config.Port
	} else {
		port = *portFlag
	}

	http.Handle("/", http.FileServer(http.Dir("./frontend")))
	http.HandleFunc("/files", handler)
	log.Printf("Сервер запущен на http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
