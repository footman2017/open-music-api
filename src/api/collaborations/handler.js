/* eslint-disable no-underscore-dangle */
class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service.collaboration;
    this._servicePlaylist = service.playlist;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifUserExist(userId);
    await this._servicePlaylist.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.verifyCollaborationExist(playlistId, userId);

    const collaborationId = await this._service.addCollaboration({
      playlistId,
      userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Collaboration berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistOwner(playlistId, credentialId, true);
    await this._service.deleteCollaboration(playlistId, userId, credentialId);

    return {
      status: 'success',
      message: 'Collaboration berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
