package com.mymusic.musicserver.service;

import com.mymusic.musicserver.model.Song;
import com.mymusic.musicserver.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SongService {

    private final SongRepository songRepository;

    private final Path musicStoragePath = Paths.get("music-storage");

    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    public Song uploadSong(
            String title,
            String artist,
            String album,
            MultipartFile file
    ) throws IOException {

        Files.createDirectories(musicStoragePath);

        String fileName = file.getOriginalFilename();

        Path finalPath = musicStoragePath.resolve(fileName);

        Files.copy(file.getInputStream(),finalPath);

        Song song = new Song(
                title,
                artist,
                album,
                fileName,
                finalPath.toString()
        );

        return songRepository.save(song);
    }

    public Path getSongFile(Long id) {
        Song song = songRepository.findById(id).orElse(null);
        String path = song.getFilePath();
        return Paths.get(path);
    }
}