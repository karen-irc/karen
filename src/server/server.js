import {KarenServer} from './app/application';

process.on('uncaughtException', function (err) {
    console.error('!Caught on uncaughtException:');
    console.error(err);

    process.abort();
});

process.on('warning', function (reason) {
    console.error('!Caught on `process.on(\'warning\')`');
    console.error(reason);

    process.abort();
});

let application = null;

export function main(options) {
    application = new KarenServer(options);
    const config = application.config();

    const httpsOptions = config.https || {};
    const protocol = httpsOptions.enable ? 'https' : 'http';
    console.log('');
    console.log('karen is now running on ' + protocol + '://' + config.host + ':' + config.port + '/');
    console.log('Press ctrl-c to stop');
    console.log('');

    const manager = application.clientManager;
    if (!config.public) {
        manager.loadUsers();
        if (config.autoload) {
            manager.autoload();
        }
    }
}
