// ==UserScript==
// @name         TDX Enhancements
// @version      4.91
// @description  Enhancements
// @author       Rob Solander
// @match        https://gmu.teamdynamix.com/TDNext/Apps/29/Tickets/*
// @match        https://gmu.teamdynamix.com/SBTDNext/Apps/29/Tickets/*
// @match        https://gmu.teamdynamixpreview.com/TDNext/Apps/29/Tickets/*
// @match        https://gmu.teamdynamixpreview.com/SBTDNext/Apps/29/Tickets/*
// @match        https://gmu.teamdynamix.com/TDWorkManagement/
// @match        https://canvas.gmu.edu/accounts/1?search_term=New_Community___
// @match        https://canvas.gmu.edu/accounts/1?search_term=New_Sandbox___
// @match        https://canvas.gmu.edu/accounts/1?search_term=New_Course___
// @match        https://canvas.gmu.edu/accounts/1/users/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=teamdynamix.com
// @downloadURL  https://mason.gmu.edu/~rsolande/TDX%20Enhancements.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/TDX%20Enhancements.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    var inprocessvar;
    var inprocessvar2;
    var inprocesscheck;
    var inprocesscheck2;
    var grab1; //= "N";
    var grabcheck; //= "N";
    var neworgvalue;
    var neworgvalue2;
    var neworgvaluevar;
    var bbcanv;
    var bb;
    var bb2;
    var bbalternate;
    var bb2alternate;
    var courseb = 'Y'
    //----------------Main TDX Ticket Page-------------------
    if (/\/TDNext\/Apps\/29\/Tickets\/TicketDet/.test (location.pathname)) {
        GM_setValue("updatecheck",'N');
        var a = document.querySelector("#divTakeTicket");
        var topp = document.querySelector("#btnRefresh").getBoundingClientRect().top + 4;
        //var topp = 126.3625;
        //var leftt = document.querySelector("#btnRefresh").getBoundingClientRect().left + 100;
        var leftt = 387.05;
        //var cleftt = document.querySelector("#divWorkflow").getBoundingClientRect().left;
        var cleftt = 1163.925048828125;
        var indices = [];
        var anvas = 'anvas'
        bb = document.querySelector("#divAttribute5046 > div > span"); //check LMS Type
        bbalternate = document.querySelector("#attribute5046-grp > div.js-ca > fieldset > label:nth-child(3)"); //check LMS Type alternate
            if (bb) {
                if (bb.innerText === 'Canvas') {
                    GM_setValue("Canvas",bbcanv);}
                else {
                    GM_setValue("Blackboard",bbcanv);}
            }
            else if (bbalternate) {
                if (bbalternate.innerText === 'Canvas') {
                    GM_setValue("Canvas",bbcanv);}
                else {
                    GM_setValue("Blackboard",bbcanv);}
            }
            else {
                //bb2 = document.querySelector("#divContent > form > div.gutter-top > div > div"); //check title
                bb2 = document.querySelector("#thTicket_spnTitle"); //check title
                bb2alternate = document.querySelector("#divContent > form > div.gutter-top > div > div > div.col-sm-9 > h1");
                if (bb2) {
                    bb = bb2.innerText;
                    if (bb = 'Escalation from Canvas Support' || bb.includes(anvas)) {
                        GM_setValue("Canvas",bbcanv);}
                    else {
                        GM_setValue("Blackboard",bbcanv);}
                }
                else if (bb2alternate) {
                    bbalternate = bb2alternate.innerText;
                    if (bbalternate.includes(anvas)) {
                        GM_setValue("Canvas",bbcanv);}
                    else {
                        GM_setValue("Blackboard",bbcanv);}
                }
            };

        // Proc Button
        //var Button2i = document.createElement("btnSubmit2i");
        //Button2i.type = "button";
        //Button2i.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmit2i"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs">In</span></button>'
        //Button2i.style = "top:127px;left:384px;position:fixed;z-index: 100;"
        // Add a click event listener to the new button
        //Button2i.addEventListener("click", function(){
        //    inprocessvar = "Y";
        //    GM_setValue("inprocess",inprocessvar);
        //    document.querySelector("#btnEdit").click();
        //});
        // Append the new button to the DOM
        //document.body.appendChild(Button2i);
        // Check if Ticket can be Grabbed - Add Button If so.
        if(a){
            //Grab Button
            var gButton = document.createElement("btnSubmitg");
            gButton.type = "button";
            gButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmitg"><span class="hidden-xs padding-left-xs">Grab</span></button>';
            gButton.style = "top:" + topp + "px;left:" + leftt + "px;position:fixed;z-index: 100";

            gButton.addEventListener("click", function(){
                grab1 = "Y";
                GM_setValue("grab1",grab1);
                javascript:__doPostBack('btnTakeTicket','');//TDX JavaScript Code for Taking a ticket
                gButton.style.display = "none";
                inprocessvar = "Y";
                GM_setValue("inprocess",inprocessvar);
                location.reload();
            });
            document.body.appendChild(gButton);
            //document.querySelector("#btnSubmitg").style.backgroundColor = "#1fdea1"
            //Cancel Button
            var CancelButton = document.createElement("CancelButton");
            CancelButton.type = "button";
            CancelButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="CancelButton"><span class="hidden-xs padding-left-xs">Cancel</span></button>'
            CancelButton.style = "top:" + topp + "px;left:" + (leftt + 65) + "px;position:fixed;z-index: 100"
            CancelButton.addEventListener("click", function(){
                inprocessvar = "C";
                GM_setValue("inprocess",inprocessvar);
                document.querySelector("#btnEdit").click();
            });
            document.body.appendChild(CancelButton);
        }
        //if not Add Resolve
        else {
            var ResolveButton = document.createElement("ResolveButton");
            ResolveButton.type = "button";
            ResolveButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="ResolveButton"><span class="hidden-xs padding-left-xs">Resolve</span></button>'
            ResolveButton.style = "top:" + topp + "px;left:" + leftt + "px;position:fixed;z-index: 100"
            ResolveButton.addEventListener("click", function(){
                inprocessvar = "R";
                GM_setValue("inprocess",inprocessvar);
                document.querySelector("#btnEdit").click();
            });
            document.body.appendChild(ResolveButton);
            document.querySelector("#ResolveButton").style.backgroundColor = "#1fdea1"
        }
        document.querySelector("#divTabHeader > ul > li:nth-child(5)").innerHTML = '';
        //check if page was grabbed, if so Move to edit page to continue setting as Inprocess
        grabcheck = GM_getValue("grab1",grab1);
        if (grabcheck === "Y") {
            grab1 = "N";
            grabcheck = "N";
            inprocessvar = "Y";
            GM_setValue("inprocess",inprocessvar);
            GM_setValue("grab1",grab1);
            document.querySelector("#btnEdit").click();
        };
        // Community course add button
        var sisaccountid = 'Community Courses'
        var collegeaffiliation = 'None/Other'
        //if (document.querySelector("#lblAttribute5321").innerText !== null){
        //if (document.querySelector("#lblAttribute5321")){
        if (document.querySelector("#divAttribute5329 > div:nth-child(4) > span")){
            if (document.querySelector("#divAttribute5329 > div:nth-child(4) > span").innerText !== 'Course/Community Name'){
                collegeaffiliation = document.querySelector("#divAttribute5329 > div:nth-child(4) > span").innerText;
				if (collegeaffiliation === 'None/Other') {sisaccountid = 'Community Courses';}
				else if (collegeaffiliation === 'Antonin Scalia Law School') {sisaccountid = 'Community Courses Law';}
				else if (collegeaffiliation === 'Carter School for Peace and Conflict Resolution') {sisaccountid = 'Community Courses Carter';}
				else if (collegeaffiliation === 'College of Education and Human Development') {sisaccountid = 'Community Courses CEHD';}
				else if (collegeaffiliation === 'College of Engineering and Computing') {sisaccountid = 'Community Courses CEC';}
				else if (collegeaffiliation === 'College of Humanities and Social Sciences') {sisaccountid = 'Community Courses CHSS';}
				else if (collegeaffiliation === 'College of Public Health') {sisaccountid = 'Community Courses CPH';}
				else if (collegeaffiliation === 'College of Science') {sisaccountid = 'Community Courses COS';}
				else if (collegeaffiliation === 'College of Visual and Performing Arts') {sisaccountid = 'Community Courses CVPA';}
				else if (collegeaffiliation === 'Costello College of Business') {sisaccountid = 'Community Courses SOB';}
				else if (collegeaffiliation === 'Honors College') {sisaccountid = 'Community Courses';}
				else if (collegeaffiliation === 'INTO Mason') {sisaccountid = 'Community Courses INTO';}
				else if (collegeaffiliation === 'Schar School of Policy and Government') {sisaccountid = 'Community Courses Schar';}
				else if (collegeaffiliation === 'University (Provost)') {sisaccountid = 'Community Courses UNIV';};
				var ButtonCom = document.createElement(ButtonCom);
	            ButtonCom.type = "button";
	            ButtonCom.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="ButtonCom"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs">Create New Community</span></button>'
	            ButtonCom.style = "top:20px;left:382px;position:fixed;z-index: 9999"
	            document.body.appendChild(ButtonCom);
	            document.querySelector("#ButtonCom").style.backgroundColor = "#2e75b2"
                courseb = 'N'
	            ButtonCom.addEventListener("click", function(){
	                var newcomvalue = document.querySelector("#divAttribute5321 > div:nth-child(4) > span").innerText;
	                GM_setValue("newcomvalue",newcomvalue);
                    GM_setValue("BBEMAIL", truncatedEmail);
                    GM_setValue("sisaccountid", sisaccountid);
                    window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Community___", "_blank");
	                //window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Community___", "_blank");
	            });
        };
        }
        else if (document.querySelector("#divAttribute5320")){//sandbox
            	var ButtonSand = document.createElement(ButtonSand);
	            ButtonSand.type = "button";
	            ButtonSand.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="ButtonSand"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs">Create New Sandbox</span></button>'
	            ButtonSand.style = "top:20px;left:382px;position:fixed;z-index: 9999"
	            document.body.appendChild(ButtonSand);
	            document.querySelector("#ButtonSand").style.backgroundColor = "#2e75b2"
                courseb = 'N';
	            ButtonSand.addEventListener("click", function(){
	                var newcomvalue = document.querySelector("#divAttribute5320 > div > span").innerText;
	                GM_setValue("newcomvalue",newcomvalue);
                    GM_setValue("BBEMAIL", truncatedEmail);
                    window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Sandbox___", "_blank");
	                //window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Community___", "_blank");
	            });
        };
        if (courseb === 'Y'){
            var ButtonCourse = document.createElement(ButtonCourse);
            ButtonCourse.type = "button";
            ButtonCourse.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="ButtonCourse"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span>+Course</button>'
            ButtonCourse.style = "top:41px;left:335px;position:fixed;z-index: 9999;padding: 0px;"
            document.body.appendChild(ButtonCourse);
            document.querySelector("#ButtonCourse").style.backgroundColor = "#2e75b2"
            ButtonCourse.addEventListener("click", function(){
                var newcomvalue = 'New Shell'
                if (document.querySelector("#divAttribute5321 > div:nth-child(4) > span")){newcomvalue = document.querySelector("#divAttribute5321 > div:nth-child(4) > span").innerText;}
                GM_setValue("newcomvalue",newcomvalue);
                GM_setValue("BBEMAIL", truncatedEmail);
                window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Course___", "_blank");
                });
            var ButtonCourse2 = document.createElement(ButtonCourse2);
            ButtonCourse2.type = "button";
            ButtonCourse2.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="ButtonCourse2"></span>+E</button>'
            ButtonCourse2.style = "top:41px;left:430px;position:fixed;z-index: 9999;padding: 0px;"
            document.body.appendChild(ButtonCourse2);
            document.querySelector("#ButtonCourse2").style.backgroundColor = "#2e75b2"
            ButtonCourse2.addEventListener("click", function(){
                var newcomvalue = 'Empty Shell'
                GM_setValue("newcomvalue",newcomvalue);
                GM_setValue("BBEMAIL", truncatedEmail);
                window.open("https://canvas.gmu.edu/accounts/1?search_term=New_Course___", "_blank");
                });
        };
                //Logic to detect New Organization on Page + Add button
//        var neworg = document.querySelector("#lblTicketType");
//        if (neworg.innerHTML.indexOf("myMason New Organization") > -1) {
//            var Button2no = document.createElement("btnSubmit2no");
//            Button2no.type = "button";
//            Button2no.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmit2no"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs">Create New ORG</span></button>'
//           Button2no.style = "top:20px;left:382px;position:fixed;z-index: 9999"
//           document.body.appendChild(Button2no);
//            document.querySelector("#btnSubmit2no").style.backgroundColor = "#2e75b2"
//            Button2no.addEventListener("click", function(){
//                neworgvalue = document.querySelector("#divAttribute2058 > div:nth-child(4) > span").innerHTML;
//                GM_setValue("neworgvalue",neworgvalue);
//                window.open("https://mymasonportal.gmu.edu/webapps/blackboard/execute/editCourseManager?context=ADD&sourceType=CLUBS", "_blank");
//           });
//        };
        var email; //FIND EMAIL CODE
        if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(2) > a")) {
            email = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(2) > a").innerText}
        else if (document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(3) > a")) {
            email = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > div:nth-child(3) > a").innerText}
        var butfloat = 10
        if (window.innerWidth < 856) {
            butfloat = 2;
        };

        //Courses Button
//        var cButton = document.createElement("btnSubmitc");
//        cButton.type = "button";
//        cButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmitc"><span class="hidden-xs padding-left-xs">Courses</span></button>';
//        cButton.style = "top:" + topp + "px;right:" + butfloat + "%;margin-right:162px;position:fixed;z-index: 100";
//        cButton.addEventListener("click", function(){
//            GM_setValue("BBEMAIL", email);
//            var Organization = "Course";
//            GM_setValue("ORG",Organization);
//            window.open("https://gmu-live.blackboard.com/webapps/blackboard/execute/userEnrollment?nav_item=list_courses_by_user&group_type=Course&user_id=_816125_1", "_blank");
//        });

        //ORGS Button
//        var oButton = document.createElement("btnSubmito");
//        oButton.type = "button";
//        oButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmito"><span class="hidden-xs padding-left-xs">Orgs</span></button>';
//        oButton.style = "top:" + topp + "px;right:" + butfloat + "%;margin-right:90px;position:fixed;z-index: 100";
//        oButton.addEventListener("click", function(){
//            GM_setValue("BBEMAIL", email);
//            var Organization = "Organization";
//            GM_setValue("ORG",Organization);
//            window.open("https://gmu-live.blackboard.com/webapps/blackboard/execute/userEnrollment?nav_item=list_courses_by_user&group_type=Course&user_id=_816125_1", "_blank");
//        });
        //Canvascourse Button
        let truncatedEmail = email.substring(0, email.length - 8);
        var canvasButton = document.createElement("btnSubmitcanvas");
        canvasButton.type = "button";
        canvasButton.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmitcanvas"><span class="hidden-xs padding-left-xs">Courses</span></button>';
        canvasButton.style = "top:" + topp + "px;right:" + butfloat + "%;margin-right:20px;position:fixed;z-index: 100";
        canvasButton.addEventListener("click", function(){
            GM_setValue("BBEMAIL", truncatedEmail);
            window.open("https://canvas.gmu.edu/accounts/1/users/76177", "_blank");
        });

        //Canvasteacher Button
        var fullname = document.querySelector("#divContent > div:nth-child(1) > div.col-md-5.col-sm-5.gutter-top > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > span > a").innerText
        var canvasButtont = document.createElement("btnSubmitcanvast");
        canvasButtont.type = "button";
        canvasButtont.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmitcanvast"><span class="hidden-xs padding-left-xs">Teach</span></button>';
        canvasButtont.style = "top:" + topp + "px;right:" + butfloat + "%;margin-right:100px;position:fixed;z-index: 100";
        canvasButtont.addEventListener("click", function(){
            window.open("https://canvas.gmu.edu/accounts/1?search_term=" + fullname + "&search_by=teacher", "_blank");
        });

        //document.body.appendChild(cButton);// Place Buttons
        //document.body.appendChild(oButton);
        document.body.appendChild(canvasButton);
        document.body.appendChild(canvasButtont);
        //Color Buttons
        //document.querySelector("#btnSubmitc").style.backgroundColor = "#2e75b2"
        //document.querySelector("#btnSubmito").style.backgroundColor = "#2e75b2"
        //document.querySelector("#btnSubmitcanvas").style.backgroundColor = "#e4060f"
        //document.querySelector("#btnSubmitcanvast").style.backgroundColor = "#e4060f"
        //document.querySelector("#btnSubmit2i").style.backgroundColor = "#1fdea1"
        //document.querySelector("#ResolveButton").style.backgroundColor = "#1fdea1"

        var text = document.querySelector("#divDescription > div.wrap-text").innerHTML
        // Step 1: Replace domain
        text = text.replace(/https:\/\/gmu\.instructure\.com\//g, "https://canvas.gmu.edu/");
        // Step 2: Make URLs clickable
        text = text.replace(/(https:\/\/canvas\.gmu\.edu\/[^\s<]+)/, '<a href="$1"target="_blank">$1</a> ');
        document.querySelector("#divDescription > div.wrap-text").innerHTML = text
    }
    //----------------Update Page-------------------
    else if (/\/TDNext\/Apps\/29\/Tickets\/Update/.test (location.pathname)) {
        var updatecheck = GM_getValue("updatecheck",updatecheck);
        if (updatecheck === 'Y') {
            window.close();
        }
        // Hide the Save button
        document.getElementById("divButtonsContainer").style.display = "none";
        // Create a new save button
        var Button = document.createElement("btnSubmit2");
        Button.type = "button";
        Button.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmit2"><span class="fa fa-floppy-o fa-nopad" aria-hidden="true"></span><span class="hidden-xs padding-left-xs" style="padding-left:0px">Save</style></span></button>'
        //Button.style = "top:6px;left:6px;position:fixed;z-index: 100" old button location
        Button.style = "top:88px;left:24px;position:fixed;z-index: 10057"
        Button.addEventListener("click", function(){
            // Check if the class exists
            if(document.getElementsByClassName("select2-search-choice").length > 0){
                // If the class exists, click the hidden button
                GM_setValue("updatecheck",'Y');
                document.getElementById("btnSubmit").click();
            } else {
                // If the class doesn't exist, show an alert
                alert("You may have forgot to add a recipient! Click Save again if you wish to continue");
                document.getElementById("divButtonsContainer").style.display = "block"; // Show the regular button
                Button.style.display = "none"; //Hide the Custom Save Button
            }
        });
        // Append the new save button to the DOM
        document.body.appendChild(Button);
        //document.querySelector("#divComments > label").innerHTML += "<button type=\"button\" id=\"profbutton\" class=\"profbutton\">Prof.</button>";
        //profbutton.addEventListener("click", function(){
        //    var proftext = document.querySelector("body > main > div:nth-child(4) > div > div.col-sm-4 > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > span > a").innerText;
        //    proftext = proftext.split(" ").slice(-1);
        //    document.querySelector("body").innerText += 'Hello Professor' + proftext[0];
        //});
        //injects 3bus (3 business days) button
        if (document.querySelector("#NewStatusId").value = 79) { // Auto change to wait customer if in-process
            document.querySelector("#NewStatusId").value = 83
        };
        var NodeOptions = document.getElementById("NewStatusId").options
        for (var i = 0; i < NodeOptions.length; i++) {
            if (NodeOptions[i].text === 'Transferred' ||
                NodeOptions[i].text === '' ||
                //NodeOptions[i].text === 'New' ||
                //NodeOptions[i].text === 'Open' ||
                NodeOptions[i].text === 'Cancelled' ||
                NodeOptions[i].text === 'Rejected' ||
                NodeOptions[i].text === 'Aborted (RFC)' ||
                NodeOptions[i].text === 'Approved (RFC)' ||
                NodeOptions[i].text === 'Deferred (RFC)' ||
                NodeOptions[i].text === 'Withdrawn (RFC)' ||
                NodeOptions[i].text === 'Faulted (RFC)' ||
                NodeOptions[i].text === 'Pending (RFC)' ||
                NodeOptions[i].text === 'Submitted (RFC)' ||
                NodeOptions[i].text === 'Pending (RFC)' ||
                NodeOptions[i].text === 'Verified (RFC)')
            {
                NodeOptions[i].hidden = true;
            };
        };


        //document.querySelector("body > main > div:nth-child(4) > div > div.col-sm-8 > div > form > div.form-group.js-off-hold-date > div.clearfix").innerHTML += "<button type=\"button\" id=\"bus3\" class=\"bus3\">3 Business Days</button>";
        //document.querySelector("body > main > div:nth-child(3) > div > form > div.col-sm-8 > div > div.form-group.js-off-hold-date > div.clearfix").innerHTML += "<button type=\"button\" id=\"bus3\" class=\"bus3\">3 Business Days</button>";
        document.querySelector("#frmTicketUpdate > div > div > div.form-group.js-off-hold-date > div.clearfix").innerHTML += "<button type=\"button\" id=\"bus3\" class=\"bus3\">3 Business Days</button>";
        bus3.addEventListener("click", function(){//Logic for button to add 3 business days and output noon time
            const currentDate = new Date();
            const numToAdd = 3;
            for (let i = 1; i <= numToAdd; i++) {
                currentDate.setDate(currentDate.getDate() + 1);
                if (currentDate.getDay() === 6) {
                    currentDate.setDate(currentDate.getDate() + 2);
                }
                else if (currentDate.getDay() === 0) {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            let day = currentDate.getDate();
            let month = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();
            let format1 = month + "/" + day + "/" + year + " 12:00 PM";
            document.querySelector("#NewGoesOffHoldDate").value = format1;
        });
    }
    // --========= Edit Page --------------------------
    else if (/\/TDNext\/Apps\/29\/Tickets\/Edit/.test (location.pathname)) {
        inprocesscheck = GM_getValue("inprocess",inprocessvar);
        inprocesscheck2 = GM_getValue("inprocess2",inprocessvar2);
        //var bbcanv2 = GM_getValue("bbcanv",bbcanv);
        var delayInMilliseconds = 600; //1 second
        var delayInMilliseconds0 = 800;
        var extratime = 0;

        if (inprocesscheck === "Y" || inprocesscheck === "C") {
            // Grab button code to set as Inprocess
            if (document.querySelector("#attribute3224Choice2460") !== null) {//prevents fail value doesn't exist  -- Checks for blank contact method and applies if nothing
            if (document.querySelector("#attribute3224Choice2460").checked === false && document.querySelector("#attribute3224Choice2461").checked === false) {//checking if setting is clicked
                document.querySelector("#attribute3224Choice2461").click();};};
            if (inprocesscheck === "Y"){document.querySelector("#attribute40").value = 79;} //Change to Inprocess
            else if (inprocesscheck === "C"){document.querySelector("#attribute40").value = 82;} //Change to Cancel
            //else if (inprocesscheck === "R"){document.querySelector("#attribute40").value = 80;}; //Change to resolved
            inprocessvar = "N";
            inprocessvar2 = "Y";
            GM_setValue("inprocess",inprocessvar);
            GM_setValue("inprocess2",inprocessvar2);
            //Check if Instructure ticket - change to user email if not.
            if (document.querySelector("#frmTicketEdit > div.hidden-xs.col-sm-4 > div > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > span > a")){
                if (document.querySelector("#frmTicketEdit > div.hidden-xs.col-sm-4 > div > div.panel.panel-default.panel-person-card > div.panel-body > div > div.media-body > span > a").innerText === 'Instructure Support') {
                    setTimeout(function() {
                        const regex = /\b[A-Za-z0-9._%+-]+@gmu\.edu\b/g;
                        var editbody = document.querySelector("#attribute138_Content").innerText
                        var useremail = editbody.match(regex)
                        const inputField = document.getElementById("attribute495_input");
                        extratime = 3000;
                        // Change its value to the desired email
                        if (inputField) {
                            inputField.value = useremail;

                            // Trigger an input event so any bound listeners update
                            const event = new Event('input', { bubbles: true });
                            inputField.dispatchEvent(event);
                        }
                        setTimeout(function() {
                            document.querySelector("#attribute495_listbox li").click();
                        }, 3000);
                    }, delayInMilliseconds0);
                };
            };
            if (document.querySelector("#attribute5046Choice11462") !== null) {//prevents fail value doesn't exist -- Checks LMS type
            if (document.querySelector("#attribute5046Choice11462").checked === true || document.querySelector("#attribute5046Choice21462").checked === true) {
                setTimeout(function() {
                    // change to Canvas
                    document.querySelector("#btnSubmit").click();
                }, delayInMilliseconds0 + extratime)
            }
            else {
                 setTimeout(function() {
                 document.querySelector("#attribute5046Choice11463").click();
                 setTimeout(function() { // Checks Type of Inquery
                     if (document.querySelector("#attribute5047Choice11466").checked === false &&//Canvas Course Site
                            document.querySelector("#attribute5047Choice11475").checked === false &&//Question
                            document.querySelector("#attribute5047Choice21458").checked === false &&//Retrieve Specific Data/Items from a Course (including Student Information)
                            document.querySelector("#attribute5047Choice11464").checked === false &&//Ally
                            document.querySelector("#attribute5047Choice11465").checked === false &&//Collab
                            document.querySelector("#attribute5047Choice11469").checked === false &&//Course Management: Canvas Admin Access Request
                            document.querySelector("#attribute5047Choice11467").checked === false &&//Course Management: Combine Courses
                            document.querySelector("#attribute5047Choice11468").checked === false &&//Course Management: Consultation/Training
                            document.querySelector("#attribute5047Choice11471").checked === false &&//Honorlock
                            document.querySelector("#attribute5047Choice11473").checked === false &&//Kaltura Multimedia Consultation/Training
                            document.querySelector("#attribute5047Choice11474").checked === false &&//Kaltura/My Media/Capture
                            document.querySelector("#attribute5047Choice21459").checked === false &&//Retrieve Specific Data/Items from a Course (including Student Information)
                            document.querySelector("#attribute5047Choice11476").checked === false &&//myMason
                            document.querySelector("#attribute5047Choice11479").checked === false &&//Respondus LockDown Browser
                            document.querySelector("#attribute5047Choice11480").checked === false &&//SafeAssign
                            document.querySelector("#attribute5047Choice11481").checked === false &&//Turnitin
                            document.querySelector("#attribute5047Choice13873").checked === false &&//Canvas Open Catalog
                            document.querySelector("#attribute5047Choice21460").checked === false &&//Collaborate Recordings
                            document.querySelector("#attribute5047Choice11482").checked === false &&//Other (explain in Description field)
                            document.querySelector("#attribute5047Choice21461").checked === false //Student Qwickly Attendance Records
                           ){
                            document.querySelector("#attribute5047Choice11475").click();//change to Question
                        };
                        document.querySelector("#btnSubmit").click();
                      }, delayInMilliseconds + extratime);
                }, delayInMilliseconds0);
             };}

            else {
                setTimeout(function() {
                    document.querySelector("#btnSubmit").click();
                }, delayInMilliseconds + extratime);
            };
        }
        else if (inprocesscheck === "R") {
            document.querySelector("#attribute40").value = 80; //Change to Resolved
            inprocessvar = "N";
            inprocessvar2 = "Y";
            GM_setValue("inprocess",inprocessvar);
            GM_setValue("inprocess2",inprocessvar2);
            var delayInMilliseconds2 = 600; //1 second
            setTimeout(function() {
                //document.querySelector("#attribute40").value = 80;
                document.querySelector("#btnSubmit").click();
                //document.querySelector("#divButtonsContainer > button.tdx-btn.tdx-btn--tertiary").click();
            }, delayInMilliseconds2);
        }
//        else if (inprocesscheck === "C") {
//            if (document.querySelector("#attribute3224Choice2460") !== null) {//prevents fail value doesn't exist  -- Checks for blank contact method and applies if nothing
//                if (document.querySelector("#attribute3224Choice2460").checked === false && document.querySelector("#attribute3224Choice2461").checked === false) {//checking if setting is clicked
//                    document.querySelector("#attribute3224Choice2461").click();
//                };
//            };
//            document.querySelector("#attribute40").value = 82; //Change to Cancelled
//            inprocessvar = "N";
//            inprocessvar2 = "Y";
//            GM_setValue("inprocess",inprocessvar);
//            GM_setValue("inprocess2",inprocessvar2);
//            if (document.querySelector("#attribute5046Choice11462") !== null) {//prevents fail value doesn't exist
//            if (document.querySelector("#attribute5046Choice11462").checked === true || document.querySelector("#attribute5046Choice11463").checked === true) {
//                setTimeout(function() {
//                    document.querySelector("#attribute5046Choice11463").click();
//                    document.querySelector("#btnSubmit").click();
//                }, delayInMilliseconds);
//            }
//            else {
//                setTimeout(function() { // Checks Type of Inquery
//                        if (document.querySelector("#attribute5047Choice11475").checked === false ||//Question
//                            document.querySelector("#attribute5047Choice11464").checked === false ||//Ally
//                            document.querySelector("#attribute5047Choice11465").checked === false ||//Collab
//                            document.querySelector("#attribute5047Choice11466").checked === false ||//Canvas Course Site
//                            document.querySelector("#attribute5047Choice11469").checked === false ||//Course Management: Canvas Admin Access Request
//                            document.querySelector("#attribute5047Choice11467").checked === false ||//Course Management: Combine Courses
//                            document.querySelector("#attribute5047Choice11468").checked === false ||//Course Management: Consultation/Training
//                            document.querySelector("#attribute5047Choice11471").checked === false ||//Honorlock
//                            document.querySelector("#attribute5047Choice11473").checked === false ||//Kaltura Multimedia Consultation/Training
//                            document.querySelector("#attribute5047Choice11474").checked === false ||//Kaltura/My Media/Capture
//                            document.querySelector("#attribute5047Choice11476").checked === false ||//myMason
//                            document.querySelector("#attribute5047Choice11479").checked === false ||//Respondus LockDown Browser
//                            document.querySelector("#attribute5047Choice11480").checked === false ||//SafeAssign
//                            document.querySelector("#attribute5047Choice11481").checked === false ||//Turnitin
//                            document.querySelector("#attribute5047Choice11482").checked === false//Other (explain in Description field)
//                           ){
//                            document.querySelector("#attribute5047Choice11475").click();//change to Question
//                        };
//                        document.querySelector("#btnSubmit").click();
//                }, delayInMilliseconds0);
//            };}
//            else {
//                setTimeout(function() {
//                    document.querySelector("#btnSubmit").click();
//                }, delayInMilliseconds);
//            };
//        }
        else if (inprocesscheck2 === "Y") {
            inprocessvar = "N";
            inprocessvar2 = "N";
            GM_setValue("inprocess2",inprocessvar2);
            grab1 = "N";
            GM_setValue("grab1",grab1);
            setTimeout(function() {
            //document.querySelector("#divButtonsContainer > button.btn.btn-danger > span.padding-left-xs").click();
            document.querySelector("#divButtonsContainer > button.tdx-btn.tdx-btn--tertiary").click(); // NEW BACK PAGE
            }, delayInMilliseconds);
        };

    }
    //-----------Blackboard Side ------------------
    //===========Courses Button==================
    else if (/gmu-live.blackboard.com/.test (location.hostname) && /\?nav_item=list_courses_by_user&group_type=Course&user_id=_816125_1/.test (location.search)) {
        var email2 = GM_getValue("BBEMAIL", email);
        var orgc = GM_getValue("ORG","Org");
        let truncatedEmail = email2.substring(0, email2.length - 8);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://gmu-live.blackboard.com/learn/api/public/v1/users/userName:" + truncatedEmail + "?fields=id", true);
        xhr.onload = function() {
            let data = JSON.parse(xhr.responseText);
            var userpk1 = data.id;
            window.open("https://gmu-live.blackboard.com/webapps/blackboard/execute/userEnrollment?editPaging=false&showAll=true&nav_item=list_courses_by_user&sortCol=courseName&sortDir=DESCENDING&startIndex=0&user_id=" + userpk1 + "&group_type=" + orgc, "_self");
        }
        xhr.send();
    }
    //===========ORGS Button==================
//    else if (/\?context=ADD&sourceType=CLUBS/.test (location.search)) {
//        neworgvalue2 = "Y";
//        GM_setValue("neworgvalue2","Y");
//        document.querySelector("#classicChoice").click();
//        document.querySelector("#courseName").value = GM_getValue("neworgvalue",neworgvalue);
//        document.querySelector("#categorizeCourse_source_select").value = '_305_1';
//    }
    //----------New Org Page types logic------
//    else if (/\?sourceType=CLUBS/.test (location.search)) {
//        if (GM_getValue("neworgvalue2",null) === "Y") {
//            document.querySelector("#courseInfoSearchKeyString").value='CourseName'
//            document.querySelector("#courseInfoSearchText").value = GM_getValue("neworgvalue",neworgvalue);
//            GM_setValue("neworgvalue2","N");
//            GM_setValue("neworgvalue3","Y");
//            GM_setValue("neworgvalue4","Y");
//            document.querySelector("#panelbutton1 > form > fieldset > div:nth-child(3) > input.button-4").click();
//        }
//        else if (/\?sourceType=CLUBS&/.test (location.search)) {
//            if (GM_getValue("neworgvalue4",null) === "Y") {
//                GM_setValue("neworgvalue4","N");
//                document.querySelector("#nav > li > a").click();
//            };
//        };
//    }
    // ----------New Org 3 page types logic PT2------
//    else if (/\&sourceType=CLUBS/.test (location.search)) {
//        if (GM_getValue("neworgvalue3",null) === "Y") {
//            email2 = GM_getValue("BBEMAIL", email);
//            let truncatedEmail = email2.substring(0, email2.length - 8);
//            GM_setValue("neworgvalue3","N");
//            document.querySelector("#courseRoleId").value = "P"
//            document.querySelector("#userName").value = truncatedEmail;
//        };
//    }
     // ----------Canvas Side PT1------
    else if (/\/accounts\/1\/users\/76177/.test (location.pathname)) {
        var email3 = GM_getValue("BBEMAIL", email);
        var useridcanvas
        var id
        console.log(email3);
        var url = "https://canvas.gmu.edu/api/v1/users/sis_login_id:" + email3;
        $.ajax({
               'type': "GET",
                'contentType': "application/json",
                'url': url,
                'success': function(canvname){
                    useridcanvas= canvname.id;
                    console.log(useridcanvas);
                    GM_setValue("BBEMAIL", '1')
                    window.open("https://canvas.gmu.edu/accounts/1/users/" + useridcanvas, "_self");
                    }

         });
    }
    // ----------Canvas Side PT2------
    else if (location.pathname.split('/')[3] === 'users') {
        var email4 = GM_getValue("BBEMAIL", email);
        if (email4 === '1') {
            document.querySelector("#courses_list > div > ul").style.maxHeight = '2000px';
            GM_setValue("BBEMAIL","N");
            //setTimeout(function() {
				let courselistlength = document.querySelector("#courses_list > div > ul").innerHTML.split('href="/courses/').length;
				for (let i = 1; i < courselistlength; i++) {

                    const seen = new Set(); // remove duplicates
                    document.querySelectorAll('#courses_list a').forEach(link => {
                        if (link.href.endsWith('#') || !seen.has(link.href)) {
                            seen.add(link.href); // Keep unique links and links ending in #
                        } else {
                            const parentLi = link.closest('li'); // Find the nearest <li> ancestor
                        if (parentLi) {
                            parentLi.remove(); // Remove the <li> and its contents
                        } else {
                            link.remove(); // Remove only the link if no <li> is found
                        }
                        }
                    });
					let newid = document.querySelector("#courses_list > div > ul").innerHTML.split('href="/courses/')[i].match(/[0-9]+\//)
				    let courselist = newid[0].slice(0, -1)
				    let url = "https://canvas.gmu.edu/api/v1/courses/" + courselist;
				    $.ajax({
						'type': "GET",
				        'contentType': "application/json",
				        'url': url,
						'success': function(canvname2){
							let courseidcanvas= canvname2.sis_course_id;
							if (courseidcanvas === null) {courseidcanvas = "";}
							else {courseidcanvas += ' -- '};
							document.querySelector("#courses_list > div > ul > li:nth-child(" + i + ") > a > span:nth-child(1)").insertAdjacentText('afterbegin', courseidcanvas);
                            document.querySelector("#courses_list > div > ul > li:nth-child(" + i + ") > a").style.maxWidth = '1200px';
                            //document.querySelectorAll('a[href*="/users/"').forEach(link => { // Removes '/users/ from links
                            //    link.href = link.href.replace(/\/users\/\w+/, '');// Removes '/users/ from links
                            //});
                            var usernum = location.pathname.split('/')[4]
                            document.querySelectorAll('a').forEach(link => {
                                if (!link.href.includes('teacher_activity') && link.href.includes('/users/' + usernum)) {
                                    link.href = link.href.replace('/users/' + usernum, ''); // Remove '/users/value' ignore teaching activity
                                }
                            });

						}
					});
				}

             //}, 90000);
        };
    }
    else if (location.search === '?search_term=New_Community___'){
        var newcomvalue = GM_getValue("newcomvalue", newcomvalue);
        var truncatedEmail = GM_getValue("BBEMAIL", truncatedEmail);
        var sisaccountid2= GM_getValue("sisaccountid", sisaccountid);
        newcomvalue = newcomvalue.replace(/&/g, "%26");
        let url = "https://canvas.gmu.edu/api/v1/accounts/sis_account_id:" + sisaccountid2 + "/courses?" +
            "course[name]=" + newcomvalue +
            "&course[course_code]=" + newcomvalue +
            "&course[term_id]=214&course[sis_course_id]=" + newcomvalue + ".community" +
            "&course[restrict_enrollments_to_course_dates]=true"
        //console.log(formData);
        //let url = "https://canvas.gmu.edu/api/v1/accounts/sis_account_id:" + sisaccountid + "/courses"
        $.ajax({//create course
            'type': 'POST',
            'contentType': 'application/json',
            'url': url,
            'success': function(canvcom){
                console.log("Success:", canvcom);
                let courseidcanvas= canvcom.id;
                let url = "https://canvas.gmu.edu/api/v1/courses/" + courseidcanvas + "/enrollments" +
                    "?enrollment[user_id]=sis_login_id:" + truncatedEmail +
                    "&enrollment[type]=TeacherEnrollment"
                    "&enrollment[state]=active"
                $.ajax({
                    'type': 'POST',
                    'contentType': 'application/json',
                    'url': url,
                    'success': function(canvcomenroll){
                        console.log("Success:", canvcomenroll);
                        window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
                        //window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
						},
                    'error': function(canvcomenroll, status, error) {
                        console.error("Error:", error);
                }

				});
            },
            'error': function(canvcom, status, error) {
                console.error("Error:", error);
            }
        });
    }
    else if (location.search === '?search_term=New_Sandbox___'){
        let newsandvalue = GM_getValue("newcomvalue", newcomvalue);
        let truncatedEmail2 = GM_getValue("BBEMAIL", truncatedEmail);
        newsandvalue = newsandvalue.replace(/&/g, "%26");
        let url = "https://canvas.gmu.edu/api/v1/accounts/116/courses?" +
            "course[name]=" + newsandvalue +
            "&course[course_code]=" + newsandvalue +
            "&course[term_id]=210&course[sis_course_id]=" + newsandvalue + ".sandbox" +
            "&course[restrict_enrollments_to_course_dates]=true"
        //console.log(formData);
        //let url = "https://canvas.gmu.edu/api/v1/accounts/sis_account_id:" + sisaccountid + "/courses"
        $.ajax({//create course
            'type': 'POST',
            'contentType': 'application/json',
            'url': url,
            'success': function(canvcom){
                console.log("Success:", canvcom);
                let courseidcanvas= canvcom.id;
                let url = "https://canvas.gmu.edu/api/v1/courses/" + courseidcanvas + "/enrollments" +
                    "?enrollment[user_id]=sis_login_id:" + truncatedEmail2 +
                    "&enrollment[type]=TeacherEnrollment"
                    "&enrollment[state]=active"
                $.ajax({
                    'type': 'POST',
                    'contentType': 'application/json',
                    'url': url,
                    'success': function(canvcomenroll){
                        console.log("Success:", canvcomenroll);
                        window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
                        //window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
						},
                    'error': function(canvcomenroll, status, error) {
                        console.error("Error:", error);
                }

				});
            },
            'error': function(canvcom, status, error) {
                console.error("Error:", error);
            }
        });
    }
        else if (location.search === '?search_term=New_Course___'){
        let newsandvalue = GM_getValue("newcomvalue", newcomvalue);
        let truncatedEmail2 = GM_getValue("BBEMAIL", truncatedEmail);
        let url = "https://canvas.gmu.edu/api/v1/accounts/146/courses?" +
            "course[name]=" + newsandvalue +
            "&course[course_code]=" + newsandvalue +
            "&course[term_id]=215&course[restrict_enrollments_to_course_dates]=true"
        if (newsandvalue === 'New Shell') {let url = "https://canvas.gmu.edu/api/v1/accounts/146/courses?" +
            "course[name]=" + truncatedEmail2 + " Requested Course" +
            "&course[course_code]=" + truncatedEmail2 + " Requested Course" +
            "&course[term_id]=214&course[restrict_enrollments_to_course_dates]=true"}
        //newsandvalue = newsandvalue.replace(/&/g, "%26");
        if (newsandvalue === 'Empty Shell') {let url = "https://canvas.gmu.edu/api/v1/accounts/10755/courses?" +
            "course[name]=" + truncatedEmail2 + " Requested Course" +
            "&course[course_code]=" + truncatedEmail2 + " Requested Course" +
            "&course[term_id]=215&course[restrict_enrollments_to_course_dates]=true"}

        //console.log(formData);
        //let url = "https://canvas.gmu.edu/api/v1/accounts/sis_account_id:" + sisaccountid + "/courses"
        $.ajax({//create course
            'type': 'POST',
            'contentType': 'application/json',
            'url': url,
            'success': function(canvcom){
                console.log("Success:", canvcom);
                let courseidcanvas= canvcom.id;
                let url = "https://canvas.gmu.edu/api/v1/courses/" + courseidcanvas + "/enrollments" +
                    "?enrollment[user_id]=sis_login_id:" + truncatedEmail2 +
                    "&enrollment[type]=TeacherEnrollment"
                    "&enrollment[state]=active"
                $.ajax({
                    'type': 'POST',
                    'contentType': 'application/json',
                    'url': url,
                    'success': function(canvcomenroll){
                        console.log("Success:", canvcomenroll);
                        window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
                        //window.open("https://canvas.gmu.edu/courses/" + courseidcanvas + "/settings", "_self");
						},
                    'error': function(canvcomenroll, status, error) {
                        console.error("Error:", error);
                }

				});
            },
            'error': function(canvcom, status, error) {
                console.error("Error:", error);
            }
        });
    }
    else {
        // Run fall-back code, if any
    };

    // Run code for all sites here.

})();