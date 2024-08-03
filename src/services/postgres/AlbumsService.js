/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelAlbum, mapDBToModelAllSongs } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModelAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: `
      SELECT 
          albums.id AS album_id,
          albums.name,
          albums.year,
          albums.created_at,
          albums.updated_at,
          albums.cover,
          songs.id AS song_id,
          songs.title,
          songs.performer
        FROM albums 
        LEFT JOIN songs ON songs."albumId" = albums.id  
        WHERE albums.id = $1
      `,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = {
      id: result.rows[0].album_id,
      name: result.rows[0].name,
      year: result.rows[0].year,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      coverUrl: result.rows[0].cover,
      songs: [],
    };

    result.rows.forEach((row) => {
      if (row.song_id) {
        album.songs.push(mapDBToModelAllSongs({
          id: row.song_id,
          title: row.title,
          performer: row.performer,
        }));
      }
    });

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, coverUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async checkAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError('Album sudah disukai');
    }
  }

  async addAlbumLike(userId, albumId) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Like album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getAlbumLike(id) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return 0;
    }
    return result.rowCount;
  }
}

module.exports = AlbumsService;
