/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var selectedSlot = '';

var app = {
    deviceReadyCallbacks: function () {
        console.log("app - device ready callbacks");
    },
    // Application Constructor
    initialize: function () {
        $("#main-content").hide();
        this.bindEvents();
        //bind no cache for dom
        $(document).bind("mobileinit", function () {
            $.mobile.page.prototype.options.domCache = false;
        });
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        setTimeout(function () {
            $("#main-content").show();
        }, 1000);
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

};

var validation = {
    isBlank: function (str) {
        return (!str || /^\s*$/.test(str));
    },
    isEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !re.test(email);
    },
    isDuplicate: function (field, value) {
        var key = "users";
        var data = localStorage.getItem(key);
        var duplicate = false;
        if (data == null) {
            console.log("data is null -> ", data);
            return false;
        } else {
            jsonData = JSON.parse(data);
            $(jsonData).each(function (i, e) {
                if (e[field] == value) {
                    console.log("Duplicate field - ", e[field]);
                    duplicate = duplicate || true;
                } else {
                    duplicate = duplicate || false;
                }
            });
            return duplicate;
        }
    }
};

/*Created by Prakash*/
function CheckAvailability() {
    setTimeout(function myFunction() {
        try {
            var slots = JSON.parse(localStorage.bookslot)
            var currentUser = JSON.parse(sessionStorage.logged_user).email;
            var bookedSlots = [];
            for (var i = 0; i < slots.length; i++) {
                if (slots[i].userName == currentUser && slots[i].outTime == "") {
                    bookedSlots.push(slots[i].slotID);
                }
            }
            for (var i = 0; i < bookedSlots.length; i++) {
                document.getElementById(bookedSlots[i]).className = "btn-disable-sameuser"
            }
        } catch (err) { }
    }, 1500)

}
function bookSlot() {
    var currentUserInfo = JSON.parse(sessionStorage.logged_user)
    var date = new Date();
    var slot = {
        userName: currentUserInfo.email,
        vehicleNo: getQueryVariable('veh_no'),
        bookinTime: date.toLocaleDateString() + "T" + date.toLocaleTimeString(),
        outTime: "",
        slotID: getQueryVariable('id'),
        IsIn: 0,
        preAmount: 30,
        finalAmount: ""
    }
    saveData("bookslot", slot);
    window.location = "dashboard.html"
}

function setSlotID(id) {
    selectedSlot = id;
}

function boolSlotRedirect() {
    var veh_no = $("#vehi_no").val();
    window.location = "pay.html?id=" + selectedSlot + "&veh_no=" + veh_no;
}
/*Created by Prakash*/

function registerUser(theForm) {
    var user = {
        name: $(theForm).find("#name").val(),
        email: $(theForm).find("#email").val(),
        mobileNo: $(theForm).find("#mobile_no").val(),
        password: $(theForm).find("#password").val(),
        cpassword: $(theForm).find("#cpassword").val(),
        isAdmin: 0,
        wallet: 50
    };
    if (!validateRegistration(user)) {
        return false;
    }
    saveData("users", user);
    window.location = "login.html?register=1";
    return false;
}

function validateRegistration(user) {
    if (validation.isBlank(user.name)) {
        showToast("Name field is empty", "Cancel", "lime");
        return false;
    }
    if (validation.isBlank(user.email)) {
        showToast("Email field is empty", "Cancel", "lime");
        return false;
    }
    if (validation.isEmail(user.email)) {
        showToast("Invalid Email address", "Cancel", "lime");
        return false;
    }
    if (validation.isDuplicate("email", user.email)) {
        showToast("Email Address already exists", "Cancel", "lime");
        return false;
    }
    if (validation.isBlank(user.mobileNo)) {
        showToast("Mobile number field is empty", "Cancel", "lime");
        return false;
    }
    if (validation.isBlank(user.password)) {
        showToast("Password field is empty", "Cancel", "lime");
        return false;
    }
    if (validation.isBlank(user.cpassword)) {
        showToast("Confirm password field is empty", "Cancel", "lime");
        return false;
    }
    if (user.password != user.cpassword) {
        showToast("Password is not matching", "Cancel", "lime");
        return false;
    }
    return true;
}

function saveData(key, value) {
    var data = localStorage.getItem(key);
    if (data == null) {
        data = [value];
        jsonStrData = JSON.stringify(data);
    } else {
        jsonData = JSON.parse(data);
        jsonData.push(value);
        jsonStrData = JSON.stringify(jsonData);
    }
    localStorage.setItem(key, jsonStrData);
}

function login(theForm) {
    var username = $(theForm).find("#username").val();
    var password = $(theForm).find("#password").val();
    if (validation.isBlank(username)) {
        showToast("Invalid Username", "Cancel", "lime");
        return false;
    }
    if (validation.isBlank(password)) {
        showToast("Invalid Password", "Cancel", "lime");
        return false;
    }
    if (checkCreds(username, password)) {
        //valid Log-in
        if(username == "admin"){
            window.location = "admin-dashboard.html?login=1";
        } else {
            window.location = "dashboard.html?login=1";
        }
    } else {
        //Invalid Log-in
        showInvalidCredsToast();
        theForm.reset();
    }
    return false;
}

function showInvalidCredsToast() {
    showToast("Invalid Credentials", "Cancel", "lime");
}

function showToast(msg, btnText, color) {
    new $.nd2Toast({
        message: msg,
        action: {
            title: btnText,
            fn: function () {
                console.log("I am the function called by 'Pick phone...'");
            },
            color: color
        },
        ttl: 3000
    });
}

function checkCreds(uname, pwd) {
    var key = "users";
    var usernameField = "email";
    var data = localStorage.getItem(key);
    var validUser = false;
    if (data == null) {
        return false;
    } else {
        jsonData = JSON.parse(data);
        $(jsonData).each(function (i, e) {
            if (e[usernameField] == uname && e.password == pwd) {
                validUser = validUser || true;
                sessionStorage.setItem('logged_user', JSON.stringify(e));
            } else {
                validUser = validUser || false;
            }
        });
        console.log("is valid user -> " + validUser);
        return validUser;
    }
}


function logout(theForm) {
    sessionStorage.clear();
    window.location = "login.html?logout=1";
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return false;
}

function checkLogin(callback) {
    var logged_user = sessionStorage.getItem('logged_user');
    if (!logged_user || logged_user == null || logged_user == "null") {
        window.location = "login.html";
    } else {
        $(document).ready(function () {
            callback();
        });
    }
}

$(document).ready(function () {
    if (getQueryVariable("login") == 1) {
        showToast("Login successful", "Cancel", "lime");
    }
    if (getQueryVariable("logout") == 1) {
        showToast("Logged out Successfully.", "Cancel", "lime");
    }
    if (getQueryVariable("register") == 1) {
        showToast("Registered Successfully.", "Cancel", "lime");
    }
});

$("#book-slots-table tbody td").on("click", function (e) {
    $(this).toggleClass("booked");
});


$(document).on("popupafteropen", "#popupDialog", function (event, ui) {
    resetCPasswdForm();
});

function resetCPasswdForm() {
    var theForm = $("#cpasswd_form");
    theForm.find("#opassword").val("");
    theForm.find("#password").val("");
    theForm.find("#cpassword").val("");
}

function updatePassword() {
    var theForm = $("#cpasswd_form");
    var key = "users";
    var usernameField = "email";
    var data = localStorage.getItem(key);
    var userData = sessionStorage.getItem("logged_user");
    jsonData = JSON.parse(data);
    var user = JSON.parse(userData);
    var opasswd = theForm.find("#opassword").val();
    console.log(opasswd + " --- " + user.password);
    if (opasswd != user.password) {
        alert("Wrong Password");
        return false;
    } else {
        user.password = theForm.find("#password").val();
        user.cpassword = theForm.find("#cpassword").val();
        if (user.password == "" || user.password != user.cpassword) {
            alert("Password empty or doesnt match");
            return false;
        }
        console.log(opasswd);
        console.log(user);
        updateData("users", "email", user.email, user);
        var userStrData = JSON.stringify(user);
        sessionStorage.setItem("logged_user", userStrData);
        $("#popupDialog").popup("close");
    }
    return validUser;
}

function updateProfile() {
    var theForm = $("#profile_form");
    var key = "users";
    var usernameField = "email";
    var data = localStorage.getItem(key);
    var userData = sessionStorage.getItem("logged_user");
    jsonData = JSON.parse(data);
    var user = JSON.parse(userData);
    user.name = theForm.find("#name").val();
    user.mobileNo = theForm.find("#mobile_no").val();
    updateData("users", "email", user.email, user);
    var userStrData = JSON.stringify(user);
    sessionStorage.setItem("logged_user", userStrData);
    return validUser;
}

///update field - item, key, obj
function updateData(item, key, value, obj) {
    var data = localStorage.getItem(item);
    if (data == null) {
        return false;
    } else {
        jsonData = JSON.parse(data);
        $(jsonData).each(function (i, e) {
            if (e[key] == value) {
                //update the data
                jsonData[i] = obj;
                //double checking the primary field
                jsonData[i][key] = value;
            }
        });
        jsonStrData = JSON.stringify(jsonData);
        localStorage.setItem(key, jsonStrData);
        return jsonData;
    }
}

function timeoutCallback(callback){
    setTimeout(callback(), 1500);
}

$(document).bind("pageload", function (event, data) {
    console.log("---------------------");
    console.log(event, data);
    console.log(data.dataUrl + " - page loaded ");
    if (data.dataUrl.search('profile') > 0) {
        console.log("Profile page");
        var callback = function(){                
            data = JSON.parse(sessionStorage.getItem('logged_user'));
            console.log(data);
            $("#name").val(data.name);
            $("#email").val(data.email);
            $("#mobile_no").val(data.mobileNo);
        };
        timeoutCallback(callback);
    } else if (data.dataUrl.search('login') > 0) {
        //insert admin record
        if(!checkCreds("admin", "admin")){
            var adminUser = {
                name: "Admin",
                email: "admin",
                mobileNo: "",
                password: "admin",
                cpassword: "admin",
                isAdmin: 1,
                wallet: 50
            };
            saveData("users", adminUser);         
        }     
    }
});