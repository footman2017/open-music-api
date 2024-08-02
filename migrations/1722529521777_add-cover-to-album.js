exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover: { type: 'text', notNull: false },
  });
};
