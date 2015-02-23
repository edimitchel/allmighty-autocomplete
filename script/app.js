var app = angular.module('app', ['autocomplete']);

// the service that retrieves some media title and type from an url
app.factory('MediaRetriever', function($http, $q, $timeout){
  var MediaRetriever = new Object();

  MediaRetriever.getMedias = function(i) {
    var mediadata = $q.defer();
    var types;

    var medias = [{ title : "The Wolverine", description : "drama", type : "movie"}, { title : "The Smurfs 2", description : "drama", type : "movie"}, { title : "The Mortal Instruments: City of Bones", description : "drama", type : "movie"}, { title : "Drinking Buddies", description : "drama", type : "movie"}, { title : "All the Boys Love Mandy Lane", description : "drama", type : "movie"}, { title : "The Act Of Killing", description : "drama", type : "movie"}, { title : "Red 2", description : "drama", type : "movie"}, { title : "Jobs", description : "drama", type : "movie"}, { title : "Getaway", description : "drama", type : "movie"}, { title : "Red Obsession", description : "drama", type : "movie"}, { title : "2 Guns", description : "drama", type : "movie"}, { title : "The World's End", description : "drama", type : "movie"}, { title : "Planes", description : "drama", type : "movie"}, { title : "Paranoia", description : "drama", type : "movie"}, { title : "The To Do List", description : "drama", type : "movie"}];

    $timeout(function(){
      mediadata.resolve(medias);
    },1000);

    return mediadata.promise
  }

  MediaRetriever.getTypes = function(i) {
    var typedata = $q.defer();
    var types;

    var types = [{ title : "Movie", description : "Type", type : "movie"},{ title : "Book", description : "drama", type : "Book"}];

    $timeout(function(){
      typedata.resolve(types);
    },1000);

    return typedata.promise
  }

  return MediaRetriever;
});

app.controller('MyCtrl', function($scope, MediaRetriever){

  $scope.medias = MediaRetriever.getMedias("...");
  $scope.medias.then(function(data){
    $scope.medias = data;
  });

  $scope.getMedias = function(){
    return $scope.medias;
  }

  $scope.types = MediaRetriever.getTypes("...");
  $scope.types.then(function(data){
    console.log(data);
    $scope.types = data;
  });

  $scope.getTypes = function(){
    return $scope.types;
  }

  $scope.doSomething = function(typedthings, type){
    console.log("Do something like reload data with this: " + typedthings );
    $scope.newmedias = MediaRetriever.getMedias(typedthings, type);
    $scope.newmedias.then(function(data){
      data.filter(function(a){
        return a.type == type;
      });

      $scope.medias = data;
    });
  }

  $scope.doSomethingElse = function(suggestion){
    console.log("Suggestion selected: " + suggestion );
  }

});
