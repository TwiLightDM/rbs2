package workWithFiles

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"sync"
)

// GetFiles - функция для получения информации о файлах в директории.
func GetFiles(dir string, order string, w http.ResponseWriter) ([]FileInfo, int, error) {
	var files []FileInfo

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
		size, format := FormatSize(files[i].Size)
		files[i].Size = size
		files[i].Format = format
	}

	return files, fullSize, nil
}

// walkDir - рекурсивная функция для обхода директории
func walkDir(dir string, files *[]FileInfo) error {

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
				*files = append(*files, FileInfo{Name: entry.Name(), Size: float64(folderSize), Format: "b", IsDir: true})
			} else {
				information, err := entry.Info()
				if err != nil {
					fmt.Println("Ошибка получения информации о файле ", entry.Name())
					return
				}
				*files = append(*files, FileInfo{Name: information.Name(), Size: float64(information.Size()), Format: "b", IsDir: false})
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

// FormatSize - функция, для форматирование размера файла + возврат названия размера файла
func FormatSize(size float64) (float64, string) {
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
