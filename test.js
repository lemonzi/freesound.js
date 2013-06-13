var freesound = require('./freesound');

freesound.apiKey = '8e541132eb0e40bd829806b7503f105e';

freesound.search('boom',{},function(data){
    data.sounds[0].getAnalysis({},function(d) {
        console.log('Analysis: ' + JSON.stringify(d));
    }, function(e) {
        console.log(e);
    });
},function(e){
    console.log('Error: ' + e);
});
