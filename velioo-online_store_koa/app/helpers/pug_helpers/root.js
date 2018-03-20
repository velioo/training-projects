const { port } = require('../../app');

module.exports = {
    moduleName: 'root',
    moduleBody: function () {
        return 'http://localhost:' + port + '/';
    }
};
