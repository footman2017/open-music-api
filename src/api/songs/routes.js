const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: (request, h) => handler.postAlbumHandler(request, h),
  },
  {
    method: 'GET',
    path: '/songs',
    handler: () => handler.getAlbumsHandler(),
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: (request, h) => handler.getAlbumByIdHandler(request, h),
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: (request, h) => handler.putAlbumByIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
  },
];

module.exports = routes;
