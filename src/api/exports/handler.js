/* eslint-disable no-underscore-dangle */
class ExportsHandler {
  constructor(service, validator) {
    this._service = service.producer;
    this._servicePlaylist = service.playlist;
    this._validator = validator;
  }

  async postExportHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this._servicePlaylist.verifyPlaylistOwner(playlistId, request.auth.credentials.id);
    await this._servicePlaylist.getPlaylistById(playlistId);
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
