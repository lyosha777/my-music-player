package com.mymusic.musicserver.controller;

import com.mymusic.musicserver.model.Song;
import com.mymusic.musicserver.repository.SongRepository;
import com.mymusic.musicserver.service.SongService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.MalformedURLException;
import java.nio.file.Path;
@RestController
@RequestMapping("/api/songs")
public class SongController{

    private final SongRepository songRepository;
    private final SongService songService;

    public SongController(SongRepository songRepository, SongService songService) {
        this.songRepository = songRepository;
        this.songService = songService;
    }

    @GetMapping
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    @GetMapping("/{id}")
    public Song getSongById(@PathVariable Long id) {
        return songRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Song createSong(@RequestBody Song song) {
        return songRepository.save(song);
    }

    @PostMapping("/upload")
    public Song uploadSong(
            @RequestParam String title,
            @RequestParam String artist,
            @RequestParam String album,
            @RequestParam MultipartFile file
    ) throws IOException {

        return songService.uploadSong(title, artist, album, file);
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) throws MalformedURLException {

        Path path = songService.getSongFile(id);

        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }
}