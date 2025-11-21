// ==UserScript==
// @name         TDXBanner
// @version      1.4
// @description  TDX Banner Enhancements
// @author       Rob Solander
// @match        https://gmu.teamdynamix.com/TDNext/Apps/29/Tickets/*
// @match        https://gmu.teamdynamix.com/SBTDNext/Apps/29/Tickets/*
// @match        https://admapp.gmu.edu/BannerAdmin/?form=*
// @match        https://patriotnav.gmu.edu/applicationNavigator/seamless
// @match        https://admapp.gmu.edu/BannerAdmin.ws/views/net/hedtech/banner/student/registration/Sfaregq/views/ViewMainWindow.html?task=SFAREGQ&lang=en
// @icon         https://www.google.com/s2/favicons?sz=64&domain=teamdynamix.com
// @downloadURL  https://mason.gmu.edu/~rsolande/TDXBanner.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/TDXBanner.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    if (/\/TDNext\/Apps\/29\/Tickets\/TicketDet/.test (location.pathname)) {
        var BannerButton1 = document.createElement("btnBannerSubmit1");
        BannerButton1.type = "button";
        BannerButton1.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnBannerSubmit1"></span><span class="hidden-xs padding-left-xs">Student Enroll</span></button>'
        BannerButton1.style = "top:80px;Right:40px;position:fixed;z-index: 100"
        document.body.appendChild(BannerButton1);
        document.querySelector("#btnBannerSubmit1").style.backgroundColor = "red"
        BannerButton1.addEventListener("click", function(){
            var gn1
            if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(4)").innerText.length === 9){
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(4)").innerText;
            }
            else if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(5)").innerText.length === 9){
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(5)").innerText;
            }
            else {
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(6)").innerText;
            };
            GM_setValue("GNUMBER",gn1);
            window.open("https://admapp.gmu.edu/BannerAdmin/?form=SFAREGQ", "_blank");
        })
        var BannerButton2 = document.createElement("btnBannerSubmit2");
        BannerButton2.type = "button";
        BannerButton2.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnBannerSubmit2"></span><span class="hidden-xs padding-left-xs">Faculty Assign</span></button>'
        BannerButton2.style = "top:50px;Right:40px;position:fixed;z-index: 100"
        document.body.appendChild(BannerButton2);
        document.querySelector("#btnBannerSubmit2").style.backgroundColor = "red";
        BannerButton2.addEventListener("click", function(){
            var gn1
            if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(4)").innerText.length === 9){
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(4)").innerText;
            }
            else if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(5)").innerText.length === 9){
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(5)").innerText;
            }
            else {
                gn1 = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(6)").innerText;
            };
            GM_setValue("GNUMBER",gn1);
            window.open("https://admapp.gmu.edu/BannerAdmin/?form=SIAASGN", "_blank");
        })
    }
    else if (/\?form=SFAREGQ/.test (location.search) || /\?form=SIAASGN/.test (location.search)) {
        var delayInMilliseconds = 4000; //1.5 second
        setTimeout(function() {
            var gnumber = GM_getValue("GNUMBER", null);
            document.querySelector("#inp\\:key_block_id").value = gnumber;
        }, delayInMilliseconds);

    }
    else if (/\/applicationNavigator\/seamless/.test (location.pathname)) {
        document.querySelector("#sidebar-fav > a").click();
        var delayInMilliseconds2 = 3000; //1.5 second
        setTimeout(function() {
            document.querySelector("#sidebar-fav > a").click();
        }, delayInMilliseconds2);
    };

    //else if (/\/BannerAdmin.ws\/views\/net\/hedtech\/banner\/student\/registration\/Sfaregq\/views\/ViewMainWindow.html/.test (location.pathname)) {
    //       var gnumber2 = GM_getValue("GNUMBER", null);
    //       var BannerButton2 = document.createElement("btnBannerSubmit1");
    //           BannerButton2.type = "button";
    //           BannerButton2.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnBannerSubmit1"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs">Student Enroll</span></button>'
    //           BannerButton2.style = "top:20px;Right:40px;position:fixed;z-index: 9999"
    //           window.onload = document.body.appendChild(BannerButton2);
    //           document.querySelector("#btnBannerSubmit1").style.backgroundColor = "red"
    //           BannerButton2.addEventListener("click", function(){
    //               document.querySelector("#inp\\:key_block_id").value = gnumber2;
    //           });
    //}

    // else {
    // Run fall-back code, if any
    //  }

    // Run code for all sites here.

})();