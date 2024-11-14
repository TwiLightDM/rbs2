package main

import "time"

type result struct {
	Path string        `json:"path"`
	Size string        `json:"size"`
	Time time.Duration `json:"time"`
}
