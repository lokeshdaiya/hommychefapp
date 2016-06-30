angular.module('hommy.controllers', ['hommy.services','google.places','ngCordova','ionic'])
.controller('AppCtrl', function ($state,$rootScope,userService,$ionicHistory,$cordovaToast,$ionicLoading) { 
        
        //logout method
        $rootScope.logout=function(){
            userService.Logout(function(){
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                $ionicHistory.nextViewOptions({disableBack: true});
                $state.go("app.login");
            })
        }
        
        //show message
        $rootScope.showMessage=function(msg,duration){
            console.log($rootScope.device)
            var env=$rootScope.device
            //if(env=="browser"){
                alert(msg);
                return;
            //}
            var holdDuration="long";
            if(duration){
                holdDuration=duration;
            }
            console.log(msg);
            $cordovaToast.show(msg,holdDuration,"bottom");
            
        }
        
//        //check if user is logged in or not
//        if (userService.isUserLoggedIn()) {
//        userService.setUserAuth(function(){
//            $ionicHistory.nextViewOptions({disableBack: true});
//            if($rootScope.kitchen!=null && $rootScope.kitchen!=undefined)
//                 $state.go("app.orders");
//               else
//                 $state.go("app.mykitchen");  
//            
//            event.preventDefault();
//            });
//        }
//        else{
//            $state.go("app.login",{},{reload:true});
//            event.preventDefault();
//        }
 })
.controller('UserController', function($scope, $state,$localstorage,userService,$rootScope,$ionicHistory,$stateParams,goBackMany,$filter,$cordovaToast,orderService,locationService) {
      $scope.signIn = function() { 
          userService.Login($scope.user, function(response){
              if(response.status==200){
                  $localstorage.set('hommyChefAuthKey',response.headers("authorization"));
                  userService.setUserAuth(function(){
                      $ionicHistory.nextViewOptions({
                        disableBack: true
                      });
                      if($rootScope.kitchen!=null && $rootScope.kitchen!=undefined)
                         $state.go("app.orders");
                       else
                         $state.go("app.mykitchen");  
                  });
                  
              }else{
                  $rootScope.showMessage("Invalid email or password");
              }
              
          })
          
      };
      
	$scope.signUp=function(){
            $scope.newUser.address=$scope.address;
            $scope.newUser.dob=new Date();
            $scope.newUser.mobile=$scope.newUser.mobile.toString();
            $scope.newUser.isChef=true;
            userService.addUser($scope.newUser,function(response){
                if(response.status==201){
                     $ionicHistory.nextViewOptions({
                        disableBack: true
                      });
                    $rootScope.registerMessage=response.data;
                    $state.go("app.registerSuccess");
                }else{
                    $rootScope.showMessage("Oops..something went wrong...please try again:details :-"+response.data);
                }
            })
		
        }
        
        $scope.getCurrentLocation=function(){
            locationService.getCurrentLatLong(function(currentLatLong){  
            var latlong=currentLatLong.latitude+','+currentLatLong.longitude;
            $rootScope.latlong=latlong;
            locationService.getCurrentAddress(latlong,function(address){
                $rootScope.currentAddress = address.full_address;
                $scope.address={
                                "addressType": "Home",
                                "address": $rootScope.currentAddress,
                                "city": address.city,
                                "area": address.city,
                                "isDefault": true
                                }
            });
        });
        }
  
  })
    .controller('KitchenController', function($scope,$rootScope,kitchenService,userService,orderService,$cordovaToast,$cordovaImagePicker,$cordovaFileTransfer,locationService,$state,$ionicHistory,utilityService) {
            
            $scope.getKitchenDishes=function(){
                  if($rootScope.kitchen==null || $rootScope.kitchen==undefined)
                  {
                     $ionicHistory.nextViewOptions({
                        disableBack: true
                      }); 
                     $rootScope.showMessage("Please fill your kitchen details"); 
                    $state.go("app.mykitchen");
                    return;
                  }  
                
                  kitchenService.getDishList($rootScope.kitchen,function(response){
                      $scope.kitchenDishes=response;  
                      kitchenService.getKitchenDetails(function(response){
                          $scope.kitchenDetails=response;
                          if(response.available==true){
                              $scope.kitchenStatus="open";
                              $scope.tapText="close";
                          }
                          if(response.available==false){
                              $scope.kitchenStatus="closed";
                              $scope.tapText="open";
                          }
                      })
                  });
            }
            
            $scope.updateDishStatus=function(item){
                var itemId=item._id;
                var data={available:item.available};
                kitchenService.updateDish(itemId,data,function(response){
                    if(response.status==200){
                        //alert("item status is updated");
                        $rootScope.showMessage("Item status updated","long","bottom")
                    }else{
                        //alert("failed to updateitem status is updated");
                        $rootScope.showMessage("Failed to update item status","long","bottom")
                    }
                })
            }
            
            $scope.updateKitchenStatus=function(){
                $scope.kitchenDetails.available=!$scope.kitchenDetails.available;
                var data={available:$scope.kitchenDetails.available};
                kitchenService.updateKitchen(data,function(response){
                    if(response.status==200){
                        if($scope.kitchenDetails.available==true){
                             $scope.kitchenStatus="open";
                             $scope.tapText="close";
                        }
                        if($scope.kitchenDetails.available==false){
                             $scope.kitchenStatus="closed";
                             $scope.tapText="open";
                        }
                        $rootScope.showMessage("Kitchen status updated","long","bottom")
                    }else{
                        $rootScope.showMessage("Failed to update kitchen status","long","bottom")
                        $scope.kitchenDetails.available=!$scope.kitchenDetails.available;
                    }
                })
            }
            
            $scope.getKitchenOrders=function(){
                if($rootScope.kitchen==null || $rootScope.kitchen==undefined)
                {
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $rootScope.showMessage("Please fill your kitchen details");
                    $state.go("app.mykitchen");
                    return;
                }
                userService.getUserDetailsById(function(response){
                    $rootScope.userDetails=response;
                    $rootScope.kitchen=response.kitchen;
                    orderService.getOrderDetails(function(response){
                        console.log(response);
                        $scope.liveOrderList=response;
                        $scope.pastOrderList=response;  
                    });
                });
            }
            
            $scope.getCuisineList=function(){
                kitchenService.getCuisine(function(response){
                    $scope.cuisines=response;
                });
            }        
          
            $scope.GetCurrentLocation=function(){    
                    if($scope.marker!=null && $scope.marker!=undefined){
                        var latlong=$scope.marker.getPosition().lat()+','+$scope.marker.getPosition().lng();
                        locationService.getCurrentAddress(latlong,function(address){
                            $scope.adderssFromMap={area:address.full_address,city:address.city,addressType:"",address:""}
                        });
                    }
               }
          
            $scope.getPicFromGallery=function(callback){
              var options = {
                   maximumImagesCount: 1,
                   width: 800,
                   height: 800,
                   quality: 80
              };
              
              $cordovaImagePicker.getPictures(options)
                .then(function (results) {
                  for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);
                    var url=$rootScope.baseApiUrl+"/upload";
                    //File for Upload
                    var targetPath = results[i];

                    // File name only
                    var filename = targetPath.split("/").pop();

                    var options = {
                         fileKey: "file",
                         fileName: filename,
                         chunkedMode: false,
                         mimeType: "image/jpg"
                     };
                     $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
                         console.log(result);
                         callback(JSON.parse(result.response))
                     }, function (err) {
                         console.log("ERROR: " + JSON.stringify(err));
                     }, function (progress) {
                         // PROGRESS HANDLING GOES HERE
                     });
                     
                  }
                }, function(error) {
                  console.log(error);
                });
            }
            
            $scope.getKitchenPic=function(){
                $scope.kitchenImages=[];
                $scope.getPicFromGallery(function(response){
                    $scope.kitchenImageUrl=response.url;
                    $scope.kitchenImages.push(response.url);
                })
            }
            
            $scope.getIDProofPic=function(){
                $scope.IDproofs=[];
                $scope.getPicFromGallery(function(response){
                    $scope.IDproofImage=response.url;
                    $scope.IDproofs.push(response.url);
                })
            }
            
            $scope.addMore = function () {
                  $scope.addons = {};
                  $scope.addOnForm = {
                      value: null
                  }
              }

            $scope.addAddOn = function () {
              $scope.addOnArray.push($scope.addons);
              $scope.addons = {};
              $scope.addOnForm = [];

          }

            $scope.myKitchenInit = function(){
                $scope.mykitchen={email:$rootScope.userDetails.email,mobile:$rootScope.userDetails.mobile,name:$rootScope.username};
                $scope.deliveryTimeArray=[
                                        {Key:"30",Value:"30 Minutes"},
                                        {Key:"45",Value:"45 Minutes"},
                                        {Key:"60",Value:"60 Minutes"},
                                        {Key:"90",Value:"1 Hour 30 Minutes"},
                                        {Key:"120",Value:"2 Hours"},
                                        {Key:"150",Value:"2 Hours 30 Minutes"},
                                        {Key:"180",Value:"3 Hours"},
                                        {Key:"480",Value:"8 Hours"},
                                    ]
           }

            $scope.insertKitchen=function(){  
                
                 //put dummy data if using from browser 
                  if($rootScope.device=="browser"){
                      $scope.IDproofs=["test"];
                      $scope.kitchenImages=["test"];
                  }
                  
//                  if(utilityService.isNullOrUndefined($scope.kitchenImageUrl) || utilityService.isNullOrUndefined($scope.IDproofImage) || utilityService.isNullOrUndefined($scope.mykitchen.secondaryPhone) || utilityService.isNullOrUndefined($scope.mykitchen.deliveryTime)){
//                      $rootScope.showMessage("All field are mandatory");
//                      return;
//                  }
                  
                  //if address and bank details are not field return and display error message
                  if($rootScope.addressValidated!=true){
                      $rootScope.showMessage("Please fill address");
                      return;
                  }
                  if($scope.bankDetailsValidated!=true){
                      $rootScope.showMessage("Please fill bank details");
                      return;
                  }
                  //add more members
                  $scope.mykitchen.city = $rootScope.adderssFromMap.city
                  $scope.mykitchen.address = $rootScope.adderssFromMap.address
                  $scope.mykitchen.area = $rootScope.adderssFromMap.full_address
                  $scope.mykitchen.loc = $rootScope.latlong
                  $scope.mykitchen.bankDetails = $scope.bankDetails
                  $scope.mykitchen.secondaryPhone = $scope.mykitchen.secondaryPhone.toString();
                  $scope.mykitchen.timings = ["12:00-23"];
                  $scope.mykitchen.IDproofs = $scope.IDproofs;
                  $scope.mykitchen.kitchenImages = $scope.kitchenImages;
                  
                  //call kitchen api
                  kitchenService.addKitchen($scope.mykitchen,function(response){
                      if(response.status==200){
                          var kitchenResult=response.data;
                          $rootScope.kitchen=kitchenResult._id
                          $rootScope.showMessage("Kitchen details updated successfully");
                          $ionicHistory.nextViewOptions({disableBack:true});
                          $state.go("app.orders");
                      }
                  })
                  
              }
     
            $scope.createbankDetails=function(){
                if(utilityService.isNullOrUndefined($scope.bankDetails.accHolder) || utilityService.isNullOrUndefined($scope.bankDetails.accNumber) || utilityService.isNullOrUndefined($scope.bankDetails.IFSC) || utilityService.isNullOrUndefined($scope.bankDetails.bankName) || utilityService.isNullOrUndefined($scope.bankDetails.branchArea)){
                    $rootScope.bankDetailsValidated=false;
                    $rootScope.showMessage("All field are mandatory");
                    return;
                }
                $rootScope.bankDetailsValidated=true;
                $ionicHistory.nextViewOptions({disableBack:true});
                $state.go("app.mykitchen");
            }  
    })
    .controller('LocationController',function($scope,$state,$ionicHistory,$rootScope,locationService) {

        $scope.myScopeVar = '';

        $scope.autocompleteOptions = {
            componentRestrictions: {
                country: 'IND'
            },
            types: ['geocode']
        };

       
       $scope.$on('g-places-autocomplete:select', function (place) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $rootScope.currentAddress=place.targetScope.model.formatted_address
            $state.go('app.signup', {});
        });

        $scope.goBack = function () {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.signup');
        }
        
        $scope.showMap=function(){
                    locationService.getLocationFromMap(function(map){
                        $scope.map=map.map;
                        $scope.marker=map.marker
                    });
        }
        
        $scope.GetLocationFromMap=function(){    
            if($scope.marker!=null && $scope.marker!=undefined){
                $rootScope.latlong=$scope.marker.getPosition().lat()+','+$scope.marker.getPosition().lng();
                locationService.getCurrentAddress($rootScope.latlong,function(address){
                    $rootScope.adderssFromMap = address;
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go("app.addAddress");
                });
            }
         }        
         
         $scope.getCurrentLocation=function(){
            if($rootScope.adderssFromMap==null || $rootScope.adderssFromMap==undefined){ 
                locationService.getCurrentLatLong(function(currentLatLong){  
                    $rootScope.latlong=currentLatLong.latitude+','+currentLatLong.longitude;
                    locationService.getCurrentAddress($rootScope.latlong,function(address){
                        $rootScope.adderssFromMap = address;
                    });
                });
            }
         }
        
        $scope.showMap=function(){
            locationService.getLocationFromMap(function(map){
                $scope.map=map.map;
                $scope.marker=map.marker
            });
        }
        
        $scope.createAddress=function(){
                if($rootScope.adderssFromMap.address==null || $rootScope.adderssFromMap.address==undefined){
                        $rootScope.addressValidated=false;
                        $rootScope.showMessage("Please fill the address");
                        return;
                }
                $rootScope.addressValidated=true;
                $ionicHistory.nextViewOptions({disableBack:true});
                $state.go("app.mykitchen");
            }  
        
        //google.maps.event.addDomListener(window, 'load', $scope.showMap());
        

    })
 ;
    