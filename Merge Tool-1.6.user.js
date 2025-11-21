// ==UserScript==
// @name         Merge Tool
// @namespace    https://mason.gmu.edu/~rsolande/
// @version      1.6
// @description  Creates panel to auto-fill GMU values
// @author       Rob Solander
// @match        https://mymasonportal.gmu.edu/webapps/blackboard/execute/crossListCourse?context=ADD&navItem=cross_list_course&sourceType=COURSES
// @match        https://mymasonportal.gmu.edu/webapps/blackboard/execute/editCourseManager?sourceType=COURSES&context=MODIFY&course_id=*
// @match        https://mymasonportal.gmu.edu/webapps/blackboard/execute/institutionalHierarchy/nodePicker?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gmu.edu
// @downloadURL  https://mason.gmu.edu/~rsolande/Merge%20Script.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/Merge%20Script.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
        var course1;
        var coursecode1;
    if (/\/webapps\/blackboard\/execute\/crossListCourse/.test (location.pathname)) {
        var term;
        //-------------------Creates Side Menu----------------------------
        var div = document.createElement("div");
        // Set the div element's style
        div.style.position = "fixed";
        div.style.top = "0";
        div.style.right = "0";
        div.style.width = "200px";
        div.style.height = "230px";
        div.style.backgroundColor = "green";
        // Append the div element to the body
        document.body.appendChild(div);

        // Create a form element
        var form = document.createElement("form");
        // Append the form element to the div element
        div.appendChild(form);

        // Create the title
        var title2 = document.createElement('h4');
        title2.innerHTML = 'Course Name';
        form.appendChild(title2);

        // Create a text input element
        var coursename1 = document.createElement("input");
        // Set the text input element's type
        coursename1.id = 'coursename1';
        coursename1.type = "text";
        // Append the text input element to the form element
        form.appendChild(coursename1);

        // Create a text input element
        var coursename2 = document.createElement("input");
        // Set the text input element's type
        coursename2.id = 'coursename2';
        coursename2.type = "text";
        // Append the text input element to the form element
        form.appendChild(coursename2);

        // Create a text input element
        var coursename3 = document.createElement("input");
        // Set the text input element's type
        coursename3.id = 'coursename3';
        coursename3.type = "text";
        // Append the text input element to the form element
        form.appendChild(coursename3);

        // Create a text input element
        var coursename4 = document.createElement("input");
        // Set the text input element's type
        coursename4.id = 'coursename4'
        coursename4.type = "text";
        // Append the text input element to the form element
        form.appendChild(coursename4);

        // Create a text input element
        var coursename5 = document.createElement("input");
        // Set the text input element's type
        coursename5.id = 'coursename5'
        coursename5.type = "text";
        // Append the text input element to the form element
        form.appendChild(coursename5);


        course1 = ""
        coursecode1 = ""
        GM_setValue("BBCOURSE", course1);
        GM_setValue("BBCODE", coursecode1);
        var Button = document.createElement("btnSubmit2");
        Button.type = "button";
        Button.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmit2"><span class="hidden-xs padding-left-xs">Submit</span></button>'
        Button.style = "top:195px;right:70px;position:fixed;z-index: 9999"
        // Add a click event listener to the new button ---------Begining of button PRess scenario-----------
        Button.addEventListener("click", function(){

            let termcode = document.getElementById('coursename1').value.substr(0, 6);
            let crn1 = document.getElementById('coursename1').value.substr(7, 5);
            let crn2 = document.getElementById('coursename2').value.substr(7, 5);
            let crn3 = document.getElementById('coursename3').value.substr(7, 5);
            let crn4 = document.getElementById('coursename4').value.substr(7, 5);
            let crn5 = document.getElementById('coursename5').value.substr(7, 5);
            GM_setValue("BBCOURSE", "");
            GM_setValue("BBCODE", "");

            var course2;
            var course3;
            var course4;
            var course5;

            var coursecode2;
            var coursecode3;
            var coursecode4;
            var coursecode5;

            var section1;
            var section2;
            var section3;
            var section4;
            var section5;

            var courseid1 = crn1;
            courseid1 += ".";
            courseid1 += termcode;
            var courseid2 = crn2;
            courseid2 += ".";
            courseid2 += termcode;
            var courseid3 = crn3;
            courseid3 += ".";
            courseid3 += termcode;
            var courseid4 = crn4;
            courseid4 += ".";
            courseid4 += termcode;
            var courseid5 = crn5;
            courseid5 += ".";
            courseid5 += termcode;

            term = document.getElementById('coursename1').value.match(/\(([^)]+)\)/)[1]; //pulling term string
            var termlength = document.getElementById('coursename1').value.match(/\(([^)]+)\)/)[1].length - 5;

            // Logic to extract 3 values from course names
            var course1length = document.getElementById('coursename1').value.substr(13).indexOf("-");
            course1 = document.getElementById('coursename1').value.substr(13, course1length);
            coursecode1 = document.getElementById('coursename1').value.substr(14+course1length, 3);
            section1 = document.getElementById('coursename1').value.substr(18+course1length, 3);

            if ((document.getElementById('coursename1').value.length < 31 + termlength) || (document.getElementById('coursename1').value.length > 33 + termlength)) {
                alert("Coursename 1 value is incorrect - check for spaces");
                return;
            };

           // if (document.getElementById('coursename1').value.length === 32 + termlength){
            //    course1 = document.getElementById('coursename1').value.substr(13, 3);
          //      coursecode1 = document.getElementById('coursename1').value.substr(17, 3);
          //      section1 = document.getElementById('coursename1').value.substr(21, 3);
          //  }
          //  else if (document.getElementById('coursename1').value.length === 33 + termlength){
           //     course1 = document.getElementById('coursename1').value.substr(13, 4);
          //      coursecode1 = document.getElementById('coursename1').value.substr(18, 3);
          //      section1 = document.getElementById('coursename1').value.substr(22, 3);
          //  }
           // else if (document.getElementById('coursename1').value.length === 31 + termlength){
           //     course1 = document.getElementById('coursename1').value.substr(13, 2);
         //       coursecode1 = document.getElementById('coursename1').value.substr(16, 3);
          //      section1 = document.getElementById('coursename1').value.substr(20, 3);
           // }
            var course2length = document.getElementById('coursename2').value.substr(13).indexOf("-");
            course2 = document.getElementById('coursename2').value.substr(13, course2length);
            coursecode2 = document.getElementById('coursename2').value.substr(14+course2length, 3);
            section2 = document.getElementById('coursename2').value.substr(18+course2length, 3);

            if ((document.getElementById('coursename2').value.length < 31 + termlength) || (document.getElementById('coursename2').value.length > 33 + termlength)) {
                alert("Coursename 2 value is incorrect - check for spaces");
                return;
            };

           // if (document.getElementById('coursename2').value.length === 32 + termlength){
//                course2 = document.getElementById('coursename2').value.substr(13, 3);
//                coursecode2 = document.getElementById('coursename2').value.substr(17, 3);
//                section2 = document.getElementById('coursename2').value.substr(21, 3);
 //           }
//            else if (document.getElementById('coursename2').value.length === 33 + termlength){
 //               course2 = document.getElementById('coursename2').value.substr(13, 4);
 //               coursecode2 = document.getElementById('coursename2').value.substr(18, 3);
//                section2 = document.getElementById('coursename2').value.substr(22, 3);
  //          }
   //         else if (document.getElementById('coursename2').value.length === 31 + termlength){
 //               course2 = document.getElementById('coursename2').value.substr(13, 2);
 //               coursecode2 = document.getElementById('coursename2').value.substr(16, 3);
 //               section2 = document.getElementById('coursename2').value.substr(20, 3);
  //          }
  //          else {
  //              alert("Coursename 2 value is incorrect - check for spaces");
  //              return;
  //          };
            var course3length = document.getElementById('coursename3').value.substr(13).indexOf("-");
            course3 = document.getElementById('coursename3').value.substr(13, course3length);
            coursecode3 = document.getElementById('coursename3').value.substr(14+course3length, 3);
            section3 = document.getElementById('coursename3').value.substr(18+course3length, 3);

 //           if ((document.getElementById('coursename3').value.length < 31 + termlength) || (document.getElementById('coursename3').value.length > 33 + termlength)) {
 //               alert("Coursename 3 value is incorrect - check for spaces");
 //               return;
 //          };

//            if (document.getElementById('coursename3').value.length === 32 + termlength){
//                course3 = document.getElementById('coursename3').value.substr(13, 3);
//                coursecode3 = document.getElementById('coursename3').value.substr(17, 3);
//                section3 = document.getElementById('coursename3').value.substr(21, 3);
//            }
//            else if (document.getElementById('coursename3').value.length === 33 + termlength){
//                course3 = document.getElementById('coursename3').value.substr(13, 4);
//                coursecode3 = document.getElementById('coursename3').value.substr(18, 3);
//                section3 = document.getElementById('coursename3').value.substr(22, 3);
//            }
//            else if (document.getElementById('coursename3').value.length === 31 + termlength){
//                course3 = document.getElementById('coursename3').value.substr(13, 2);
//                coursecode3 = document.getElementById('coursename3').value.substr(16, 3);
//                section3 = document.getElementById('coursename3').value.substr(20, 3);
//            }
            if ((document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename3').value.length < 31 + termlength) || (document.getElementById('coursename3').value.length > 33 + termlength)) {
                alert("Coursename 3 value is incorrect - check for spaces");
                return;
            };

            var course4length = document.getElementById('coursename4').value.substr(13).indexOf("-");
            course4 = document.getElementById('coursename4').value.substr(13, course4length);
            coursecode4 = document.getElementById('coursename4').value.substr(14+course4length, 3);
            section4 = document.getElementById('coursename4').value.substr(18+course4length, 3);


//            if (document.getElementById('coursename4').value.length === 32 + termlength){
//                course4 = document.getElementById('coursename4').value.substr(13, 3);
//                coursecode4 = document.getElementById('coursename4').value.substr(17, 3);
//                section4 = document.getElementById('coursename4').value.substr(21, 3);
//            }
//            else if (document.getElementById('coursename4').value.length === 33 + termlength){
//                course4 = document.getElementById('coursename4').value.substr(13, 4);
//                coursecode4 = document.getElementById('coursename4').value.substr(18, 3);
//                section4 = document.getElementById('coursename4').value.substr(22, 3);
//            }
//            else if (document.getElementById('coursename4').value.length === 31 + termlength){
//                course4 = document.getElementById('coursename4').value.substr(13, 2);
//                coursecode4 = document.getElementById('coursename4').value.substr(16, 3);
//                section4 = document.getElementById('coursename4').value.substr(20, 3);
//            }
            if ((document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename4').value.length < 31 + termlength) || (document.getElementById('coursename4').value.length > 33 + termlength)){
                alert("Coursename 4 value is incorrect - check for spaces");
                return;
            };

            var course5length = document.getElementById('coursename5').value.substr(13).indexOf("-");
            course5 = document.getElementById('coursename5').value.substr(13, course5length);
            coursecode5 = document.getElementById('coursename5').value.substr(14+course5length, 3);
            section5 = document.getElementById('coursename5').value.substr(18+course5length, 3);

//            if ((document.getElementById('coursename5').value.length < 31 + termlength) || (document.getElementById('coursename5').value.length > 33 + termlength)) {
//                alert("Coursename 5 value is incorrect - check for spaces");
//                return;
//            };
//           if (document.getElementById('coursename5').value.length === 32 + termlength){
//                course5 = document.getElementById('coursename5').value.substr(13, 3);
//                coursecode5 = document.getElementById('coursename5').value.substr(17, 3);
//                section5 = document.getElementById('coursename5').value.substr(21, 3);
//            }
//            else if (document.getElementById('coursename5').value.length === 33 + termlength){
//                course5 = document.getElementById('coursename5').value.substr(13, 4);
//                coursecode5 = document.getElementById('coursename5').value.substr(18, 3);
//                section5 = document.getElementById('coursename5').value.substr(22, 3);
//            else if (document.getElementById('coursename5').value.length === 31 + termlength){
//                course5 = document.getElementById('coursename5').value.substr(13, 2);
//                coursecode5 = document.getElementById('coursename5').value.substr(16, 3);
//                section5 = document.getElementById('coursename5').value.substr(20, 3);
//            }
            if ((document.getElementById('coursename5').value.length > 0 && document.getElementById('coursename5').value.length < 31 + termlength) || (document.getElementById('coursename5').value.length > 33 + termlength)){
                alert("Coursename 5 value is incorrect - check for spaces");
                return;
            };


            // extra checking for missing values:
            if (document.querySelector("#coursename1").value.length === 0 || document.querySelector("#coursename2").value.length === 0){
                alert("You cannot leave CourseName Blank for the first 2");
                return;
            };

            //  Places course name fields based on 2 scenarios
            // Scenario 1 Has same Course abreviation and Number
            if (course1+coursecode1 === course2+coursecode2){
                if (document.getElementById('coursename3').value.length === 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + section2 + " \(" + term + "\)";
                }
                else if (document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length === 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + section2 + "/" + section3 + " \(" + term + "\)";
                }
                else if(document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length === 0 ) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + section2 + "/" + section3 + "/" + section4 + " \(" + term + "\)";
                }
                else if(document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length > 0 ) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + section2 + "/" + section3 + "/" + section4 + "/" + section5 + " \(" + term + "\)";
                };

            }
            // Scenario 2 Doesn't have same Course abreviation and Number
            else {
                if (document.getElementById('coursename3').value.length === 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + course2 + "-" + coursecode2 + "-" + section2 + " \(" + term + "\)";
                }
                else if (document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length === 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + course2 + "-" + coursecode2 + "-" + section2 + "/" + course3 + "-" + coursecode3 + "-" + section3 + " \(" + term + "\)";
                }
                else if(document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length === 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + course2 + "-" + coursecode2 + "-" + section2 + "/" + course3 + "-" + coursecode3 + "-" + section3 + "/" + course4 + "-" + coursecode4 + "-" + section4 + " \(" + term + "\)";
                }
                else if(document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length > 0) {
                    document.querySelector("#courseName").value = "Master - " + course1 + "-" + coursecode1 + "-" + section1 + "/" + course2 + "-" + coursecode2 + "-" + section2 + "/" + course3 + "-" + coursecode3 + "-" + section3 + "/" + course4 + "-" + coursecode4 + "-" + section4 + "/" + course5 + "-" + coursecode5 + "-" + section5 + " \(" + term + "\)";
                };
            }

            //Figures out what to place as course ID Value and child courseIDs:
            if (document.getElementById('coursename3').value.length === 0) {
                document.querySelector("#courseId").value = "Master_" + crn1 + "_" + crn2 + "." + termcode;
                document.querySelector("#childCourseIds").value = courseid1 + "," + courseid2;
            }
            else if (document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length === 0) {
                document.querySelector("#courseId").value = ("Master_" + crn1 + "_" + crn2 + "_" + crn3 + "." + termcode);
                document.querySelector("#childCourseIds").value = courseid1 + "," + courseid2 + "," + courseid3;
            }
            else if (document.getElementById('coursename3').value.length > 0 && document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length === 0) {
                document.querySelector("#courseId").value = ("Master_" + crn1 + "_" + crn2 + "_" + crn3 + "_" + crn4 + "." + termcode);
                document.querySelector("#childCourseIds").value = courseid1 + "," + courseid2 + "," + courseid3 + "," + courseid4;
            }
            else if (document.getElementById('coursename4').value.length > 0 && document.getElementById('coursename5').value.length > 0) {
                document.querySelector("#courseId").value = ("Master_" + crn1 + "_" + crn2 + "_" + crn3 + "_" + crn4 + "_" + crn5 + "." + termcode);
                document.querySelector("#childCourseIds").value = courseid1 + "," + courseid2 + "," + courseid3 + "," + courseid4 + "," + courseid5;
            };

            //Store 2 codes for Node page in memory
            GM_setValue("BBCOURSE", course1);
            GM_setValue("BBCODE", coursecode1);

            //Sets term
            const termelements = document.querySelectorAll("#termId > option");
            // Loop through each element and get its text content and value content
            termelements.forEach(termelement =>{
                var termtext = termelement.textContent;
                var termvalue = termelement.value;
                if (termtext === term) { //find match pulled from course name
                    document.querySelector("#termId").value=termvalue;
                };
                });


            //if (termcode === "202340"){
           //      document.querySelector("#termId").value="_252_1";
           // }
            //else if (termcode === "202370"){
           //      document.querySelector("#termId").value="_254_1";
            //}
           // else if (termcode === "202410"){
           //      document.querySelector("#termId").value="_275_1";
           // };

        });


        // Create the title
        var ending = document.createElement('h5');
        ending.innerHTML = 'GMU CourseMergeTool';
        ending.id = 'ending';
        // ending.style.color = 'Green'
        ending.style = "padding:10px";
        form.appendChild(ending);

        //places button after all code as loaded
        document.body.appendChild(Button);
        //Sets two values to approprate after term is set

        document.querySelector("#available_no").checked = "checked";
        document.querySelector("#durationType_continuous").checked = "checked";
    }
    else if (/\/execute\/editCourseManager/.test (location.pathname)) {
            GM_setValue("BBCOURSE", "");
            GM_setValue("BBCODE", "");

            var course1lengthx = document.querySelector("#courseName").value.substr(13).indexOf("-");
            course1 = document.querySelector("#courseName").value.substr(13, course1lengthx);
            coursecode1 = document.querySelector("#courseName").value.substr(14+course1lengthx, 3);
            //Store 2 codes for Node page in memory
            GM_setValue("BBCOURSE", course1);
            GM_setValue("BBCODE", coursecode1);
    }
    // ----------- Node Page Populate -------------------
    else if (/\/execute\/institutionalHierarchy\/nodePicker/.test (location.pathname)) {
        if (/\?cmd=openPicker/.test (location.search)) {

            var coursen1 = GM_getValue("BBCOURSE", course1);
            var coursen2 = GM_getValue("BBCODE", coursecode1);

            document.querySelector("#searchValue").value=coursen1+coursen2;
            document.querySelector("#panelbutton1 > form > fieldset > ol > li:nth-child(3) > input").click();
            // document.querySelector("#listContainer_selectBox_8397_1").checked = "checked";
        }
        else if (/\?cmd=searchPicker/.test (location.search)) {
            var Buttonn = document.createElement("btnSubmitn");
            Buttonn.type = "button";
            Buttonn.innerHTML += '<button type="submit" class="btn btn-primary btn-sm js-progress-button" id="btnSubmitn"><span class="hidden-xs padding-left-xs">Distance Learning</span></button>'
            Buttonn.style = "top:125px;right:360px;position:fixed"
            // Add a click event listener to the new button ---------Begining of button PRess scenario-----------
            Buttonn.addEventListener("click", function(){
                document.querySelector("#searchValue").value="Distance Learning";
                document.querySelector("#panelbutton1 > form > fieldset > ol > li:nth-child(3) > input").click();
            });
            document.body.appendChild(Buttonn);
            	var nodeList = document.querySelectorAll("#listContainer_row\\:0 > td.smallCell > span");
                nodeList[0].firstElementChild.click();
        };
    };
})();