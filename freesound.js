var request = require('request');

var _URI_SOUND = '/sounds/<sound_id>/',
    _URI_SOUND_ANALYSIS = '/sounds/<sound_id>/analysis/',
    _URI_SOUND_ANALYSIS_FILTER ='/sounds/<sound_id>/analysis/<filter>',
    _URI_SIMILAR_SOUNDS = '/sounds/<sound_id>/similar/',
    _URI_SEARCH = '/sounds/search/',
    _URI_CONTENT_SEARCH = '/sounds/content_search/',
    _URI_GEOTAG = '/sounds/geotag',
    _URI_USER = '/people/<user_name>/',
    _URI_USER_SOUNDS = '/people/<user_name>/sounds/',
    _URI_USER_PACKS = '/people/<user_name>/packs/',
    _URI_USER_BOOKMARKS = '/people/<username>/bookmark_categories',
    _URI_BOOKMARK_CATEGORY_SOUNDS = '/people/<username>/bookmark_categories/<category_id>/sounds',
    _URI_PACK = '/packs/<pack_id>/',
    _URI_PACK_SOUNDS = '/packs/<pack_id>/sounds/';

function _make_uri(uri,args) {
    for (var a in args) {
        uri = uri.replace(/<[\w_]+>/, args[a]);
    }
    return module.exports.BASE_URI + uri;
}

function _make_request(uri,success,error,params,wrapper){
    params = params || {};
    if (!params.api_key) params.api_key = module.exports.apiKey;
    request(uri, {
        json: true,
        qs: params
    }, function(e, r, data) {
        if (!e) {
            if(success) success(wrapper?wrapper(data):data);
        } else {
            if(error) error(e);
        }
    });
    console.log(uri);
}

function _make_sound_object(snd){
    snd.getAnalysis = function(options, success, error){
        if (!options) options = {};
        var params = {all: options.showAll?1:0};
        var base_uri = options.filter? _URI_SOUND_ANALYSIS_FILTER:_URI_SOUND_ANALYSIS;
        _make_request(_make_uri(base_uri,[snd.id,options.filter?options.filter:""]),success,error);
    };
    snd.getSimilarSounds = function(success, error){
        _make_request(_make_uri(_URI_SIMILAR_SOUNDS,[snd.id]),success,error,_make_sound_collection_object);
    };
    return snd;
}

function _make_sound_collection_object(col){
    var get_next_or_prev = function(which,success,error) {
        _make_request(which,success,error,_make_sound_collection_object);
    };
    col.nextPage = function(success,error) {
        get_next_or_prev(col.next,success,error);
    };
    col.previousPage = function(success,error) {
        get_next_or_prev(col.previous,success,error);
    };
    col.sounds.forEach(_make_sound_object);
    return col;
}

function _make_pack_collection_object(col){
    var get_next_or_prev = function(which,success,error) {
        _make_request(which,success,error,_make_pack_collection_object);
    };
    col.nextPage = function(success,error) {
        get_next_or_prev(col.next,success,error);
    };
    col.previousPage = function(success,error) {
        get_next_or_prev(col.previous,success,error);
    };
    col.packs.forEach(_make_pack_object);
    return col;
}

function _make_user_object(user){
    user.getSounds = function(success, error){
        _make_request(_make_uri(_URI_USER_SOUNDS,[user.username]),success,error,_make_sound_collection_object);
    };
    user.getPacks = function(success, error){
        _make_request(_make_uri(_URI_USER_PACKS,[user.username]),success,error);
    };
    user.getBookmarkCategories = function(success, error){
        _make_request(_make_uri(_URI_USER_BOOKMARKS,[user.username]),success,error);
    };
    user.getBookmarkCategorySounds = function(ref, success, error){
        _make_request(ref,success,error);
    };
    return user;
}

function _make_pack_object(pack){ // receives json object already "parsed"
    pack.getSounds = function(success, error){
        _make_request(_make_uri(_URI_PACK_SOUNDS,[pack.id]),success,error,_make_sound_collection_object);
    };
    return pack;
}

module.exports = {
    BASE_URI : "http://www.freesound.org/api",
    apiKey : '',

    getFromRef: function(ref, success,error){
        _make_request(ref,success,error,{});
    },
    getSound : function(soundId, success,error){
        _make_request(_make_uri(_URI_SOUND,[soundId]),success,error,{},_make_sound_object);
    },
    getUser : function(username, success,error){
        _make_request(_make_uri(_URI_USER,[username]),success,error,{},_make_user_object);
    },
    getPack : function(packId, success,error){
        _make_request(_make_uri(_URI_PACK,[packId]),success,error,{},_make_pack_object);
    },
    search: function(query, options, success, error){
        var params = {q:(query ? query : " ")};
        if (options) {
            if(options.page)params.p = options.page;
            if(options.filter)params.f = options.filter;
            if(options.sort)params.s = options.sort;
            if(options.num_results)params.num_results = options.num_results;
            if(options.sounds_per_page)params.sounds_per_page = options.sounds_per_page;
            if(options.fields)params.fields = options.fields;
        }
        _make_request(_make_uri(_URI_SEARCH), success,error,params, _make_sound_collection_object);
    },
    contentBasedSearch: function(target, options, success, error){
        var params = {};
        if (options) {
            if(options.page)params.p = options.page;
            if(options.filter)params.f = options.filter;
            if(options.target)params.t = options.target;
            if(options.max_results)params.max_results = options.max_results;
            if(options.sounds_per_page)params.sounds_per_page = options.sounds_per_page;
            if(options.fields)params.fields = options.fields;
        }
        _make_request(_make_uri(_URI_CONTENT_SEARCH),success,error,params,_make_sound_collection_object);
    },
    geotag: function(min_lat, max_lat, min_lon, max_lon, options, success, error){
        var params = {};
        if(min_lat)params.min_lat = min_lat;
        if(max_lat)params.max_lat = max_lat;
        if(min_lon)params.min_lon = min_lon;
        if(max_lon)params.max_lon = max_lon;
        if (options) {
            if(options.page)params.p = options.page;
            if(options.sounds_per_page)params.sounds_per_page = options.sounds_per_page;
            if(options.fields)params.fields = options.fields;
        }
        _make_request(_make_uri(_URI_GEOTAG), success,error,params, _make_sound_collection_object);
    }
};