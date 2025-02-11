/* eslint-disable no-underscore-dangle */
class AlbumsHandler {
  constructor(service, validator) {
    this._service = service.album;
    this._serviceStorage = service.storage;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._serviceStorage.writeFile(cover, cover.hapi);

    await this._service.editAlbumCoverById(id, `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._service.checkAlbumLike(credentialId, id);
    await this._service.addAlbumLike(credentialId, id);

    const response = h.response({
      status: 'success',
      message: 'Berhasil Menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteAlbumLike(credentialId, id);

    return {
      status: 'success',
      message: 'Like album berhasil dihapus',
    };
  }

  async getAlbumByLikeHandler(request, h) {
    const { id } = request.params;
    const { albumLike, cacheStatus } = await this._service.getAlbumLike(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: albumLike,
      },
    });
    response.header('X-Data-Source', cacheStatus);
    return response;
  }
}

module.exports = AlbumsHandler;
