package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
)

// printFileSizes - функция для вывода имен файлов, папок и их размеров
func printFileSizes(dir string) {
	var files []info

	walkDir(dir, &files)

	sort.Slice(files, func(i, j int) bool {
		return files[i].size > files[j].size
	})

	fmt.Println("Список файлов и папок в директории:", dir)
	for _, file := range files {
		size, format := formatSize(file.size)
		if file.isDir {
			fmt.Println("Директория: ", file.name, "Размер: ", size, format)
		} else {
			fmt.Println("Файл: ", file.name, "Размер: ", size, format)
		}
	}
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

// walkDir - рекурсивная функция для обхода директории.
func walkDir(dir string, files *[]info) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		fmt.Println("Ошибка при чтении директории :", dir)
		return
	}

	for _, entry := range entries {
		fullPath := filepath.Join(dir, entry.Name())

		if entry.IsDir() {
			folderSize := getFolderSize(fullPath)
			*files = append(*files, info{entry.Name(), float64(folderSize), true})
		} else {
			info, err := entry.Info()
			if err != nil {
				fmt.Println("Ошибка получения информации о файле ", entry.Name())
				continue
			}
			*files = append(*files, info{info.Name(), float64(info.Size()), false})
		}
	}
}

// getFolderSize - функция для получения общего размера папки и её содержимого.
func getFolderSize(folderPath string) int64 {
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
	}

	return size
}

func main() {
	dirPath := flag.String("dir", "", "")
	flag.Parse()
	printFileSizes(*dirPath)
}
