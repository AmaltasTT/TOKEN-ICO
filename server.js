//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/ico-frontend/browser'));
 console.log(__dirname)

app.get('/*', function(req,res) {
    
    res.sendFile(path.join(__dirname, 'dist/ico-frontend/browser/index.html'));
});

// Start the app by listening on the default Heroku port

try {
  app.listen(process.env.PORT || 8080);
    
} catch (error) {
  console.log(error);  
}