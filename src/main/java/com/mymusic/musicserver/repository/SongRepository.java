package com.mymusic.musicserver.repository;

import com.mymusic.musicserver.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {

}