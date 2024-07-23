const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongsToPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.deleteSongsFromPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
];

module.exports = routes;
