const webhookSerializer = ({
  endpoint,
  active,
  userId,
  id,
  name,
  createdAt,
  updatedAt,
}, overrideAttrs = {}) => {
  const { meta, ...others } = overrideAttrs;

  return ({
    id,
    type: 'webhooks',
    attributes: {
      name,
      active,
      endpoint,
      createdAt,
      updatedAt,
      ...others,
    },
    meta,
    relationships: {
      user: {
        data: {
          id: userId,
          type: 'users',
        }
      },
    },
  });
};

module.exports = webhookSerializer;
