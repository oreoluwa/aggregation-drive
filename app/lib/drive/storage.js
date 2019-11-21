const Balancer = require('weighted-round-robin');

class Storage {
  constructor(userId) {
    this.userId = userId;
    this.providers = new Balancer();
  }

  addIdentity(identity, client, weight) {
    return this.providers.add({
      identity,
      weight,
      client,
    });
  }

  getIdentity () {
    return this.providers.get();
  }
}

module.exports = Storage;
