var refreshToken = "";

//storage keys
var KEY_LOGGED_IN_USER_JSON = "loggedInUser";
var KEY_ORG_ID = "orgId";
var KEY_ORG_NAME = "orgName";
var KEY_COUNTRIES = "countriesData";
var KEY_LICENSE_ID = "licenseId";
var KEY_STATE_SOC = "state_soc";
var KEY_STATE = "state";
var KEY_ORG_ROLES = "orgRoles";
var KEY_UNIT_TYPES = "unitTypes";
var KEY_UNIT_ID = "unitId";
var KEY_FORGOT_UNAME = "forgotUname";
var KEY_ORG_SUBS_DATA = "orgSubscriptionData";
var KEY_USER_ID = "userId";
var KEY_NOTICE_ID= "noticeID";

//storage keys for oauth
var KEY_REFRESH_TOKEN = "refreshToken";
var KEY_ACCESS_TOKEN = "accessToken";
var KEY_TOKEN_EXPIRY = "tokenExpiry";
var KEY_TOKEN_LAST_ACCESSED = "tokenLastAccessed";
var KEY_RT_EXPIRY_DATE = "rtExpiryDate";





var setStorageData = function(key, value) {
	//console.log("setting key="+key+", value="+ value);
    sessionStorage.setItem(key, value);
};

var getStorageData = function(key) {
	//console.log("getting key="+key);
    return sessionStorage.getItem(key);
};

var clearStorage = function(){
	//why not just sessionStorage.clear() ?
	
	var i = sessionStorage.length;
	while(i--) {
	  var key = sessionStorage.key(i);
	  sessionStorage.removeItem(key);
	}
};







getBaseUrl = function() {
    return baseurl;
};

var ajaxRequest = function(data, method, url, successCallBack, errorCallback) {
    console.log("ajaxRequest method=" + method + ", url=" + url);
	if(data != null){
		console.log("data=" + JSON.stringify(data));
	}

    var fullurl = baseurl + url;

	var params = {
        type: method,
        url: fullurl,
        dataType: "json",
        success: function(response) {
			if(response != null){
				console.log("success response=" + JSON.stringify(response));
				if(response.messages != null && response.messages.length > 0) {
					processMessages(response.messages, this);
				}
				if(response.accessInfo != null) {
					setOauth(response.accessInfo);
				}
			}
			
			if(successCallBack != null){
				successCallBack(response);
			}
        },
        contentType: "application/json",
        error: function(xhr, ajaxOptions, thrownError) {
			console.log("error thrownError=" + thrownError);
            console.log("xhr="+xhr);
            
			if (xhr != null && xhr.responseText != null) {
				console.log("xhr.responseText="+JSON.stringify(xhr.responseText));
				try {
					var responseObject = JSON.parse(xhr.responseText);
					if(responseObject.messages != null && responseObject.messages.length > 0){
						processMessages(responseObject.messages, this);
					}else{
						showMessage("Error processing, please try later", "error");
					}
					if(errorCallback != null){
						errorCallback(responseObject);
					}
				} catch (e) {
					showMessage("Error processing, please try later", "error");
				}
				
			}else{
				showMessage("Error processing, please try later", "error");
			}
			
        }
    };
	
	//since this is a common method for GET, POST, PUT, DELETE
	//we don't want to set null data in case of GET
	//else, it adds a null query param for GET request
	if(method != "GET"){
		params.data = JSON.stringify(data);
	}
	
    $.ajax(params);
}

var processMessages = function(msgArray, request) {
    console.log("processMessages"+msgArray);

    for (i = 0; i < msgArray.length; i++) {
        msg = msgArray[i];
		if(msg.code == INVALID_AUTH_TOKEN){
			authTokenExpired(request);
		}else{
			showMessage(msg.message, msg.type);
		}
    }
}




var logout = function(){
	//localStorage.clear();
	var url = "api/users/logout";
	
	var loggedInUser = getStorageData(KEY_LOGGED_IN_USER_JSON);
	var loggedInUserObj = JSON.parse(loggedInUser);
	
	var data = {};
	if(loggedInUserObj != null){
		data.userId = loggedInUserObj.id;
	}
	//data.deviceId = -1;
	
    ajaxRequest(data, "POST", url, 
		function(){
    		clearStorage();
			window.location.href = "../html/login.html";
		}, null
	);
	
}

var showMessage = function(message, type){
	
	$(".alert-dismissible").remove();
	
	var alertClass = "alert-info";
	if(type != null){
		if(type.toLowerCase() == "error"){
			alertClass = "alert-danger";
		}else if(type.toLowerCase() == "warning"){
			alertClass = "alert-warning";
		}else if(type.toLowerCase() == "success"){
			alertClass = "alert-success";
		}
		
	}
	//alert(errorMessage);

	//show bootstrap alert message
	$('body').prepend("<div class='alert " + alertClass +" alert-dismissible' role='alert'>"+
									"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
										"<span aria-hidden='true'>&times;</span>"+
									"</button>" + message + 
							  " </div>");
							  
	 $('html, body').animate({
        scrollTop: $(".alert-dismissible").offset().top
    }, 500);
}

var isValidEmailAddress = function(emailAddress) {
	var pattern = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	return pattern.test(emailAddress);
};

var isValidPhoneNumber = function(phonenumber) {
	var pattern = new RegExp(/^[0-9]{10}$/);
	return pattern.test(phonenumber);
};

var isValidIsdPhoneNumber = function(phonenumber) {	
	var pattern = new RegExp(/^\+[1-9]{1}[0-9]{3,14}$/);
	return pattern.test(phonenumber);
};

//try to get country code from a different select box wherever possible
var getPhoneObjFromText = function(rawPhone){
	//TODO - extract country code and number using google lib
	var phone = {};
	if(rawPhone == ""){
		return phone;
	}
	phone.countryCode = rawPhone.substr(0,3);
	phone.number = rawPhone.substr(3,rawPhone.length);
	return phone;
}


var loadHeader = function () {
	$("#header").load("header.html", function () {
		//header has loaded

		var loggedInUser = getStorageData(KEY_LOGGED_IN_USER_JSON);
		var loggedInUserObj = JSON.parse(loggedInUser);
		var homePage = getHomePage();
		if (loggedInUserObj != null) {
			//now, set home page
			$("#homePage").attr('href', homePage);
			var name = loggedInUserObj.name;
			//show user name
			$("#headerUser").text(name);
		}

		//set breadcrumbs
		setBreadcrumbs(homePage);
	});
}

var getHomePage = function(){
	var landingPage = "";
	
	var loggedInUser = getStorageData(KEY_LOGGED_IN_USER_JSON);
	var loggedInUserObj = JSON.parse(loggedInUser);
	console.log(loggedInUserObj);
	if(loggedInUserObj == null){
		return landingPage;
	}
	else{
		landingPage = "society_details.html";

	}
	
	console.log("landingPage="+landingPage);
	return landingPage;
}

var getCurrentPagename = function(){
	var segments = window.location.pathname.split('/');
	var toDelete = [];
	for (var i = 0; i < segments.length; i++) {
		if (segments[i].length < 1) {
			toDelete.push(i);
		}
	}
	for (var i = 0; i < toDelete.length; i++) {
		segments.splice(i, 1);
	}
	var filename = segments[segments.length - 1];
	console.log(filename);
	return filename;
}

var setBreadcrumbs = function(homePage){
	var addLiToBreadcrums = function(name, href){
		$('#breadcrumbs').append(
			$('<li>').append(
				$('<a>').attr('href',href).append(name)
			)
		);
	}
	var addActiveLiToBreadcrums = function(name){
		$('#breadcrumbs').append(
			$('<li class="active">').append(name)			
		);
	}
	
	
	var currentPage = getCurrentPagename();
	
	if(currentPage.toLowerCase() == "profile.html" 
		|| currentPage.toLowerCase() == "settings.html" 
		|| currentPage.toLowerCase() == "help.html" ){
			
		$("#breadcrumbs").show;
		//User's Home
		addLiToBreadcrums("Home", homePage);
		
	}
	
	//currently show breadcrumbs only for XA as there is only 1 page for SA
	if(homePage == "xa_home.html"){
		$("#breadcrumbs").show;
		
		//Current society
		var orgName = getStorageData(KEY_ORG_NAME);
		if(orgName == null || orgName == ""){
			orgName = "Society";
		}
		
		if(currentPage.toLowerCase() == "xa_home.html"){
			//XA Home
			addActiveLiToBreadcrums("Home");
		}
		if(currentPage.toLowerCase() == "society_details.html"){
			//XA Home
			addLiToBreadcrums("Home", "xa_home.html");
			//current society name
			addActiveLiToBreadcrums(orgName);
		}
		if(currentPage.toLowerCase() == "license.html"){
			//XA Home
			addLiToBreadcrums("Home", "xa_home.html");		
			//Add licence
			addActiveLiToBreadcrums("License");				
		}
		if(currentPage.toLowerCase() == "society.html"){
			//XA Home
			addLiToBreadcrums("Home", "xa_home.html");		
			//Add licence
			addActiveLiToBreadcrums("Society");				
		}
		if(currentPage.toLowerCase() == "edit_license.html"){
			//XA Home
			addLiToBreadcrums("Home", "xa_home.html");		
			//Add licence
			addActiveLiToBreadcrums("Edit License");				
		}
		if(currentPage.toLowerCase() == "edit_society.html"){
			//XA Home
			addLiToBreadcrums("Home", "xa_home.html");		
			//Add licence
			addActiveLiToBreadcrums("Edit Society");				
		}
	}else{
		$("#breadcrumbs").hide;
	}
}

//Use this method to set data in to htlm or innerhtml. This will avoid XSS attack.
function htmlEncode(value) {
	// Create a in-memory div, set its inner text (which jQuery automatically encodes)
	// Then grab the encoded contents back out. The div never exists on the page.
	return $('<div/>').text(value).html();
}

function htmlDecode(value) {
	return $('<div/>').html(value).text();
}

function addPhoneValidation(){
	if(window.Parsley){
		window.Parsley.addValidator('phone', {
			  validateString: function(value) {
				return isValidPhoneNumber(value);
			  }, messages: {
				en: 'This value should be a valid Mobile number.'
			  }
			});
	}
}

/*function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return year + '-' + monthNames[monthIndex] + '-' + day;
}*/

function populateCountryCodes(elementId){
	$("#"+elementId).empty();
	var o = new Option("IN (+91)", "+91");
    $("#"+elementId).append($(o));
}

function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function goToSocietyDetails(){
	window.location.href="society_details.html";
}

var jump = function(h){
    var url = location.href;               //Save down the URL without hash.
    location.href = "#"+h;                 //Go to the target element.
    history.replaceState(null,null,url);   //Don't like hashes. Changing it back.
}

function formatDate(date) {
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) 
    	month = '0' + month;
    if (day.length < 2) 
    	day = '0' + day;

    return [day, month, year].join('/');
}

function formatDateTime(date) {
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    hr = d.getHours();
    mins = d.getMinutes();
    secs = d.getSeconds();

    if (month.length < 2) 
    	month = '0' + month;
    if (day.length < 2) 
    	day = '0' + day;
    if (hr.length < 2) 
    	hr = '0' + hr;
    if (mins.length < 2) 
    	mins = '0' + mins;
    if (secs.length < 2) 
    	secs = '0' + secs;
    var resDate = [day, month, year].join('/');
    var resTime = [hr, mins, secs].join(':');

    return resDate+" "+resTime;
}

function checkRoleExists(roleId){
	var roleExists =false;
	
	var loggedInUser = getStorageData(KEY_LOGGED_IN_USER_JSON);
	var loggedInUserObj = JSON.parse(loggedInUser);
	if(loggedInUserObj == null){
		return roleExists;
	}
	var roles = loggedInUserObj.roles;
	
	if(!isEmpty(roles)) {
		for (i = 0; i < roles.length; i++) {
			var role = roles[i];
			
			if (role.id == roleId) {
				roleExists = true;
			}
		}
	}
	
	return roleExists;
}

function isXAUser(){
	return checkRoleExists(ROLE_XA);
}

function isSAUser(){
	return checkRoleExists(ROLE_SA);
}

function hasSubsExpired(subsExpiryDate){
	var today = new Date();
	var expiry = new Date(subsExpiryDate);
	if(today > expiry){
		return true;
	}else{
		return false;
	}
}

function isSubsExpiringSoon(subsExpiryDate){
	var todayPlus7Days = new Date();
	todayPlus7Days.setDate(todayPlus7Days.getDate() + 7);
	var expiry = new Date(subsExpiryDate);
	if(!hasSubsExpired(subsExpiryDate)){
		if(todayPlus7Days > expiry){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}
