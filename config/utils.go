package config

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strconv"
	"unicode/utf8"
)

// LoadConfig - функция, для взятие информации из файла конфига
func LoadConfig() (*Config, error) {
	file, err := os.Open("config.json")
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

// DefPhpUrl Функция для получения php url из конфига
func DefPhpUrl() (string, error) {
	config, err := LoadConfig()
	if err != nil {
		return "", err
	}

	phpUrl := config.PhpURL
	return phpUrl, nil
}

// DefPort - Функция для определения порта
func DefPort(port string) (string, error) {
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
	config, err := LoadConfig()
	if err != nil {
		return "", err
	}

	port = config.Port
	return port, nil
}
