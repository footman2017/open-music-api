/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
  constructor(service, validator) {
    this._servicePlaylist = service.playlist;
    this._serviceSong = service.song;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._servicePlaylist.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._servicePlaylist.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._servicePlaylist.verifyPlaylistOwner(id, credentialId, true);
    await this._servicePlaylist.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongsToPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const playlistId = request.params.id;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistOwner(playlistId, credentialId);
    await this._serviceSong.getSongById(songId);

    await this._servicePlaylist.addPlaylistSongs({
      playlistId,
      songId,
    });

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._servicePlaylist.verifyPlaylistOwner(id, credentialId);

    const playlist = await this._servicePlaylist.getPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongsFromPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._servicePlaylist.verifyPlaylistOwner(id, credentialId);

    const { songId } = request.payload;

    await this._servicePlaylist.deleteSongFromPlaylistById(id, songId);

    return {
      status: 'success',
      message: 'lagu berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
