/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, owner, createdAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addPlaylistSongs({ playlistId, songId }) {
    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT p.id, p."name", u.username FROM playlists p 
        LEFT JOIN users u ON u.id = p."owner"
        WHERE p."owner" = $1
      `,
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `
        select p.id as playlist_id, p."name", u.username, s.id as song_id, s.title, s.performer
        from playlist_songs ps 
        left join playlists p on p.id = ps.playlist_id 
        left join songs s on s.id = ps.song_id
        left join users u on u.id = p."owner"
        where ps.playlist_id = $1
      `,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = {
      id: result.rows[0].playlist_id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs: result.rows.map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      })),
    };

    return playlist;
  }

  async deleteSongFromPlaylistById(id, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
