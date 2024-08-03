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

  async verifyPlaylistOwner(id, owner, isDelete = false) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      if (!isDelete) {
        const queryCollab = {
          text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
          values: [id, owner],
        };

        const resultCollab = await this._pool.query(queryCollab);

        if (!resultCollab.rowCount) {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
      } else {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT p.id, p."name", u.username 
        FROM playlists p 
        LEFT JOIN users u ON u.id = p."owner"
        WHERE p."owner" = $1
        UNION
        SELECT p.id, p."name", u.username
        FROM collaborations c 
        LEFT JOIN playlists p ON p.id = c.playlist_id 
        LEFT JOIN users u ON u.id = p.owner
        WHERE c.user_id = $1
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

    if (!result.rowCount) {
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

    if (!result.rowCount) {
      throw new NotFoundError('lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  // activities

  async addPlaylistSongActivity(playlistId, songId, userId, action) {
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [nanoid(16), playlistId, songId, userId, action, new Date().toISOString()],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongActivity(id) {
    const query = {
      text: `
        select psa.playlist_id, u.username, s.title, "action", "time"
        from playlist_song_activities psa
        left join playlists p on p.id = psa.playlist_id 
        left join songs s on s.id = psa.song_id 
        left join users u on u.id = psa.user_id
        where psa.playlist_id = $1
        order by time asc
      `,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist activities tidak ditemukan');
    }

    return {
      playlistId: result.rows[0].playlist_id,
      activities: result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
      })),
    };
  }
}

module.exports = PlaylistsService;
