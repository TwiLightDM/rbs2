package main

type fileInfo struct {
	Name   string  `json:"name"`
	Size   float64 `json:"size"`
	Format string  `json:"format"`
	IsDir  bool    `json:"isDir"`
}
