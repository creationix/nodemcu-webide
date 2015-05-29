-- Run this file using luvit.
-- To install the deps, run `lit install creationix/weblit`
-- Then run the server with `luvit server.lua`
-- And point your browser to http://localhost:8080/

require('weblit-app')
  .use(require('weblit-logger'))
  .use(require('weblit-auto-headers'))
  .use(require('weblit-static')(module.dir))
  .start()
