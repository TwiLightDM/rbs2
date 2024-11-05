package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
)

// printFileSizes - функция для вывода имен файлов, папок и их размеров
func printFileSizes(dir string, order string) error {
	if dir == "" {
		fmt.Println("Для того, чтобы пользоваться мной, укажите директорию через -dir \nПри желание можно указать порядок вывода через -order")
		return nil
	}

	order = strings.ToLower(order)
	if order == "" {
		order = "asc"
	}
	if order != "asc" && order != "desc" {
		fmt.Println("Неправильный ввод режима сортировки. \nДля сортировку по убыванию напишите desc. \nДля сортировку по возрастанию напишите asc, либо не используйте данный параметр.")
		return nil
	}
	var files []info

	err := walkDir(dir, &files)
	if err != nil {
		fmt.Println("Обработана ошибка ", err)
	}

	if len(files) == 0 {
		return nil
	}
	if order == "asc" {
		sort.Slice(files, func(i, j int) bool {
			return files[i].size < files[j].size
		})
	} else {
		sort.Slice(files, func(i, j int) bool {
			return files[i].size > files[j].size
		})
	}

	fmt.Println("Список файлов и папок в директории:", dir)
	for _, file := range files {
		size, format := formatSize(file.size)
		if file.isDir {
			fmt.Println("Директория: ", file.name, "Размер: ", size, format)
		} else {
			fmt.Println("Файл: ", file.name, "Размер: ", size, format)
		}
	}
	return nil
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
			return value, "mb"
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
				*files = append(*files, info{entry.Name(), float64(folderSize), true})
			} else {
				information, err := entry.Info()
				if err != nil {
					fmt.Println("Ошибка получения информации о файле ", entry.Name())
					return
				}
				*files = append(*files, info{information.Name(), float64(information.Size()), false})
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
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})

	if err != nil {
		fmt.Println("Ошибка при расчете размера папки ", folderPath)
		return 0, err
	}

	return size, nil
}

func main() {
	dirPath := flag.String("dir", "", "")
	order := flag.String("order", "", "")
	flag.Parse()
	err := printFileSizes(*dirPath, *order)
	if err != nil {
		fmt.Println("Обработана ошибка ", err)
	}
}
