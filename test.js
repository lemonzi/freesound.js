var freesound = require('./freesound');

// freesound.apiKey = require('./key');
freesound.apiKey = 'MY_API_KEY';

freesound.search('boom',{},function(data){
    data.sounds[0].getAnalysis({},function(d) {
        console.log('Analysis: ' + JSON.stringify(d));
    }, function(e) {
        console.log(e);
    });
},function(e){
    console.log('Error: ' + e);
});
