var freesound = require('./freesound');

freesound.apiKey = '8e541132eb0e40bd829806b7503f105e';
freesound.search('boom',{},function(data){
    console.log(data);
},function(e){
    console.log('Error: ' + e);
});