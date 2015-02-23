/* --- Made by justgoscha and licensed under MIT license --- */

var app = angular.module('autocomplete', []);

app.directive('autocomplete', function() {
  var index = -1;

  return {
    restrict: 'E',
    scope: {
      searchParam: '=ngModel',
      types: '=typedata',
      datas: '=data',
      onType: '=onType',
      onSelect: '=onSelect',
      autocompleteRequired: '='
    },
    controller: ['$scope', '$timeout', 'TypeService', function($scope, $timeout, TypeService){
      $scope.selectedIndex = -1;

      $scope.suggestions;

      this.getSuggestions = function(){
        return $scope.suggestions;
      }

      $scope.initLock = true;

      $scope.lockTyping = false;

      $scope.setIndex = function(i){
        $scope.selectedIndex = parseInt(i);
      };

      this.setIndex = function(i){
        $scope.setIndex(i);
        $scope.$apply();
      };

      $scope.getType = function(i){
        if($scope.type === false)
          return '';
        else 
          return $scope.type + " ";
      };

      $scope.getIndex = function(i){
        return $scope.selectedIndex;
      };

      var watching = true;

      $scope.type = false;

      $scope.datas = [];

      $scope.completing = false;

      $scope.searchFilter = "";

      $scope.$watch('searchParam', function(newValue, oldValue){
        if($scope.lockTyping) {
          $scope.searchParam = $scope.type + ' ';
          return;
        }

        if(!newValue)
          return;

        if(oldValue != undefined && $scope.searchParam != undefined && oldValue.length - 1 == $scope.searchParam.length)
          return;

        oldValue = oldValue == undefined ? oldValue : oldValue.trim();
        newValue = newValue == undefined ? newValue : newValue.trim();
        if($scope.type + " " + $scope.searchFilter == newValue)
          return;

        if (oldValue === newValue || $scope.initLock) {
          return;
        }

        if(watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
          $scope.completing = true;
          var isType = $scope.isTypeTyped($scope.searchParam.trim().split(' ')[0]);
          if(!isType){
            $scope.searchFilter = $scope.searchParam;
            $scope.type = false;
          } else {
            $scope.lockTyping = true;
            $timeout(function(){
              $scope.lockTyping = false;
            }.bind(this), 550);
          }
          $scope.selectedIndex = -1;
        }

        if($scope.onType)
          $scope.onType($scope.searchFilter, $scope.type);
      });

      $scope.isTypeTyped = function(query){
        if($scope.type !== false && query == ' ')
          return false;

        var regExpType = new RegExp('(' +
          query.split(' ').join('|') + ')', 'i');
        var type = [];
        for(var i = 0; i < $scope.suggestions.length; i++){
          if(regExpType.test($scope.suggestions[i].title))
            type.push($scope.suggestions[i]);
        }
        if(type.length === 1){
          type = type[0];
          console.log(type);
          if(TypeService.isType(type)) {
            $scope.type = type.title;
            $scope.searchFilter = $scope.searchParam.substr(type.type.length + 1);
            $scope.searchParam = type.type + " " + $scope.searchFilter;
            return true;
          }
          return false;
        }
        return false;
      }

      $scope.$watch('datas', function(newValue, oldValue){
        function returnSelected(value, value2){
          if(value2 == undefined)
            return value;
          value = angular.copy(value);
          value2 = angular.copy(value2);
          var values = value;

          // On ajoute les types s'il n'y a pas un de sélectionné
          if($scope.type === false)
            values = value.concat(value2);
          values = values.sort(function(d, e){
            return TypeService.isType($scope.type) ? 1 : -1;
          });

          var modifiedValues = angular.copy(values);
          
          modifiedValues.filter(function(word){
            if(word == undefined)
              return false;
            else if($scope.searchFilter)
              return true;
            
            var words = '(' +
                $scope.searchFilter.split(' ').join('?|') +
              ')'
            , exp = new RegExp(words, 'gi');
            if (words.length){
              var v = (exp.test(word.title));
              if(v && $scope.hasType && $scope.type === word.type)
                return true;
              else if(v)
                return true;
              else 
                return false;
            } else return false;
          });
          if(modifiedValues == values)
            return modifiedValues;
          return modifiedValues;
        }

        if(newValue !== oldValue)
          $scope.suggestions = returnSelected($scope.datas, $scope.types);
      });

      this.preSelect = function(suggestion){
        watching = false;
        $scope.$apply();
        watching = true;
      };

      $scope.preSelect = this.preSelect;

      this.preSelectOff = function(){
        watching = true;
      };

      $scope.preSelectOff = this.preSelectOff;

      $scope.select = function(suggestion){
        if(suggestion){
          $scope.searchParam = ($scope.type === false ? '' : $scope.type + ' ') + suggestion.title;

          if(TypeService.isType(suggestion))
            $scope.type = suggestion.title;

          if($scope.onSelect)
            $scope.onSelect(suggestion.description, $scope.type === false);
        }
        watching = false;
        $scope.completing = false;
        setTimeout(function(){
          watching = true;
        },1000);
        $scope.setIndex(-1);
      };

      $scope.$watch('type', function(newValue, oldValue){
        console.log("Changement type: " + newValue);
      });

      function isType(obj){

      }
    }],
    link: function(scope, element, attrs){

      setTimeout(function() {
        scope.initLock = false;
        scope.$apply();
      }, 250);

      var attr = '';

      scope.attrs = {
        "placeholder": "start typing...",
        "class": "",
        "id": "",
        "inputclass": "",
        "inputid": ""
      };

      for (var a in attrs) {
        attr = a.replace('attr', '').toLowerCase();
        if (a.indexOf('attr') === 0) {
          scope.attrs[attr] = attrs[a];
        }
      }

      if (attrs.clickActivation) {
        element[0].onclick = function(e){
          if(!scope.searchParam){
            setTimeout(function() {
              scope.completing = true;
              scope.searchFilter = "";
              scope.$apply();
            }, 200);
          }
        };
      }
      var key = { left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27, tab: 9, super: 91, backspace : 8 };

      if (attrs.clearWithCtrlBack) {
        element[0].onkeydown = function(e){
          var k = e.keyCode || e.which;
          if(scope.type !== false && (e.ctrlKey || k == key.super) && k == key.backspace){
            scope.searchParam = "";
            e.preventDefault();
          }
        };
      }


      document.addEventListener("keydown", function(e){
        var keycode = e.keyCode || e.which;

        switch (keycode){
          case key.esc:
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
        }
      }, true);

      document.addEventListener("blur", function(e){
        setTimeout(function() {
          scope.select();
          scope.setIndex(-1);
          scope.$apply();
        }, 150);
      }, true);

      element[0].addEventListener("keydown",function (e){
        var keycode = e.keyCode || e.which;

        var l = angular.element(this).find('li').length;

        if(!scope.completing || l == 0) return;

        switch (keycode){
          case key.up:
            index = scope.getIndex() - 1;
            if(index <- 1){
              index = l - 1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              break;
            }
            scope.searchParam = scope.getType() + scope.suggestions[index].title;
            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(scope.suggestions[index]);

            scope.$apply();

            break;
          case key.down:
            index = scope.getIndex() + 1;
            if(index < -1){
              index = l - 1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              scope.$apply();
              break;
            }
            scope.searchParam = scope.getType() + scope.suggestions[index].title;
            scope.setIndex(index);

            if(index !== -1)
              scope.preSelect(scope.suggestions[index]);

            scope.$apply();

            break;
          case key.left:
            break;
          case key.right:
          case key.enter:
          case key.tab:

            index = scope.getIndex();
            scope.preSelectOff();
            if(index !== -1) {
              scope.select(scope.suggestions[index]);
              if(keycode == key.enter) {
                e.preventDefault();
              }
            } else {
              if(keycode == key.enter) {
                scope.select();
              }
            }
            scope.setIndex(-1);
            scope.$apply();

            break;
          case key.esc:
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
            break;
          default:
            return;
        }

      });
    },
    templateUrl: 'templates/autocomplete-view.html'
  };
});

app.filter('searchMediaFilter', function () {
  return function (input, searchFilter, type) {
    if (typeof input === 'undefined' || typeof searchFilter == 'undefined') return input;
    var returnInput = [];
    for(var i = 0; i < input.length; i++){
      var word = input[i];
      if(word == undefined)
        return false;
      else if(word == "")
        return true;
      var s = searchFilter.replace('/\./', '\.');

      var words = '(' +
          s.split(' ').join('|') +
        ')',
        exp = new RegExp(words, 'gi');
      if((exp.test(word.title)))
        returnInput.push(word);
    }

    return returnInput;
  };
});

app.filter('highlight', ['$sce', function ($sce) {
  return function (input, searchFilter) {
    if (typeof input === 'function' || typeof input === 'undefined') return '';
    var returnInput = "";
    if(searchFilter.split(' ')[0] == '')
      return $sce.trustAsHtml(input);
    var words = '(' +
          searchFilter.split(' ').join('|') + ')',
        exp = new RegExp(words, 'gi');
    if (words.length) {
      returnInput = input.replace(exp, function(match){
        return '<span class="highlight">' + match + '</span>';
      });
    }
    return $sce.trustAsHtml(returnInput);
  };
}]);

app.filter('withType', ['$sce', function ($sce) {
  return function (input, type) {
    if (typeof input === 'function') return '';
    var r;

    if(type == undefined || type === false)
      r = input.toString();
    else 
      r = '<span class=\'type\'>' + type + '</span> ' + input.toString();
    
    return $sce.trustAsHtml(r);
  };
}]);

app.service('TypeService', [function () {
  this.isType = function (obj){
    if(obj == false || obj == undefined)
      return false;
    console.log(obj);
    if(angular.isObject(obj))
      obj = obj.description;
    if(obj.toLowerCase() == 'type' || obj.toLowerCase() == 'language')
      return true;
    return false;
  }
}])

app.directive('suggestion', function(){
  return {
    scope: {
      suggestion : "="
    },
    restrict: 'A',
    require: '^autocomplete', 
    link: function(scope, element, attrs, autoCtrl){
      element.bind('mouseenter', function() {
        autoCtrl.preSelect(attrs.val);
        autoCtrl.setIndex(attrs.index);
      });

      element.bind('mouseleave', function() {
        autoCtrl.preSelectOff();
      });
    }
  };
});
