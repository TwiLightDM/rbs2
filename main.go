package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"sync"
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
				*files = append(*files, info{entry.Name(), float64(folderSize), "b", true, dir})
			} else {
				information, err := entry.Info()
				if err != nil {
					fmt.Println("Ошибка получения информации о файле ", entry.Name())
					return
				}
				*files = append(*files, info{information.Name(), float64(information.Size()), "b", false, dir})
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

func main() {
	http.Handle("/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/files", handler)
	log.Println("Сервер запущен на http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
