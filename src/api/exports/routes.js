const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: (request, h) => handler.postExportHandler(request, h),
    options: {
      auth: 'musicsapp_jwt',
    },
  },
];

module.exports = routes;
