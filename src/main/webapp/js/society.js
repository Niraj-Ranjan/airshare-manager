var url = window.location.href;

var arr = url.split('?');
//var arr1 = arr[1].split('=');
//console.log("Id: " + arr1[1]);
//var orgId = getStorageData(KEY_ORG_ID);
//var orgName = "";
//console.log("orgId: " + orgId);

$(document).ready(function() {

    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function(e) {
        //console.log( 'show tab' );
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust()
            .responsive.recalc();
        setStorageData(KEY_STATE_SOC, $(this).attr('data-target'));
    });

    var tb = getStorageData(KEY_STATE_SOC);

    if (tb != null) {
        // soctab
        $('#myTab a[data-target="' + tb + '"]').tab('show');
    }

 
    // 1. Dashboard view: ends

    // 2. Society details: starts
   
   
    // 2. Society details: ends


	
	// 3. Users tab data: ends

	// 4. Users functionalities: starts

    // Edit User: Starts
    

    // Delete User: Starts
    
    // Delete User: Ends


    // Approve User: Starts
   
    // Approve User: Ends

    // Activate / Deactivate User: Starts
    

    

    //Activate / Deactivate User: Ends

	// 4. Users functionalities: ends

    // 5. Units functionalities: Starts

    // 5.a. Display Units data: Starts
   
    //var myUnitsData = [];
    

    var branchDataSet = [


        {
            "id":"1",
            "name": "Computer Science & Engineering",
            "regcode": "CSE001"

        },
        {
            "id": "2",
            "name": "Information Technology",
            "regcode": "IT001"
        }
       
    ];

    var semDataSet = [
        {
            "id":"1",
            "name":"First Sem."
        },
        {
            "id": "2",
            "name": "Second Sem."

        }, {
            "id": "3",
            "name": "Third Sem."

        }, {
            "id": "4",
            "name": "Fourth Sem."

        }, {
            "id": "5",
            "name": "Fifth Sem."

        }, {
            "id": "6",
            "name": "Sixth Sem."

        }, {
            "id": "7",
            "name": "Seventh Sem."

        }, {
            "id": "8",
            "name": "Eight Sem."

        }

    ]



var branch;
var sem;
var doc;
    

	$("#BranchTable").dataTable({
			data: branchDataSet,
			responsive: true,
            bLengthChange: false,
            bFilter: false,
            bInfo: false, paging: false,
			//"deferRender": true,
			columns: [
					  { data: "id" },
					  { data: "name" },
					  { data: "regcode" }
                ],
                columnDefs: [{
                    "width": "20%",
                    "targets": 0
                }]
			
        });



            $('#BranchTable tbody').on('click', 'tr', function () {
                var table = $('#BranchTable').DataTable();
                var data = table.row(this).data();
                var data1 = JSON.parse(JSON.stringify(data));
                console.log(data1);
                branch = data;
            });


        

        $("#SemTable1").dataTable({
            data: semDataSet,
            responsive: true,
            bLengthChange: false,
            bFilter: false,
            bInfo: false, paging: false,
            //"deferRender": true,
            columns: [
                {
                    data:'id'
                },
                {
                    data:'name'
                }
                
            ]

        });


        $('#SemTable1 tbody').on('click', 'tr', function () {
            var table = $('#SemTable1').DataTable();
            var data = table.row(this).data();
            var data1 = JSON.stringify(data)
            console.log(data1);
            sem = data;
        });




        $("#sendDocument").on('click', function () {
            // get the values of the subject and body fields
         

            var comment = $("#messageMultiSub1").val();
        


            var msg = {};
            msg["comments"] = comment;
            msg["branchDTO"] = branch;
            msg["semDTO"] = sem;
            msg["img"] = doc;


            var myurl = "api/document";
            ajaxRequest(msg, "POST", myurl, processMsgSuccess1, null);

            return false;
        });
        
       

    // 5.a. Display Units data: Ends

    // 5.b. Create Unit: Starts

    // 5.b. Create Unit: Starts
    // 5.c. Edit Unit
   
    // 5.d. Delete unit: Starts

    
   

    // 5.d. Delete unit: Ends

    // 5.e. Multicast: Starts

   

    

    
    // 6. Subscription functionalities: Starts

    

    // 6.a. Add Subscription: starts
    /*$("#addsubscription").click(function() {
        $("#addsubs").parsley().reset();
        OpenModal("add", "");
        //$("#addsubs").modal();
    });*/
    // 6.a. Add Subscription: ends

    // 6.b. Edit Subscription: starts
    
	
    // 6.c. Delete Subscription: ends

    // 6. Subscription functionalities: ends

    // 7. Message functionalities: Starts
    

   





    

    

    

    var processMsgSuccess1 = function(response) {
        console.log("Message sent successfully");
        alert('Document Sent Successfully')
        
    };
    
    


    



//upload attachments
    var i = {};
    $('#upload').click(function () {

        var fd = new FormData();
        var file = $('#file')[0].files[0];
        fd.append('file', file);
        console.log(file);

        var myurl = getBaseUrl();
        myurl += "api/images";
        console.log(myurl);
        console.log(attachemnstId);
        // AJAX request
        $.ajax({
            url: myurl,
            type: "POST",
            timeout: 6000,
            data: fd,
            contentType: false,
            processData: false,
            
            success: function (response) {
                if (response != 0) {
                    i["id"] = JSON.stringify(response.data.id);
                    attachemnstId.push(response.data);
                    getAttach(response);
                    doc = response.data;
                  console.log("success response=" + JSON.stringify(response.data));
                } else {
                    alert('file not uploaded');
                }
            }
        });
    });
//print list of attchments in society details


   


    
    
    // 7.a. Send Message: Ends

    // 7. Message functionalities: Ends

    // 8. History functionalities: Starts

    //iterate over the json response object

    

    
	

    // 8. History functionalities: Ends
    /*
    Units Table Start
    1. Get all units for soc
    2. Add Unit
    3. Edit Unit
    4. Delete Unit
    */


        var initMsgForm = function () {
            $('#msgForm').parsley().reset();
            $("#msgForm").trigger('reset');
            $("#msgForm").modal();


          
        };

$("#multiMsg").on("click", initMsgForm);

 $("#closeMsg").on("click", function () {
     $.modal.close();
 });    



var brachTableMessage;
var semTableMessage;

 $("#BranchTableMessage").dataTable({
     data: branchDataSet,
     responsive: true,
     bLengthChange: false,
     bFilter: false,
     bInfo: false,
     paging: false,
     //"deferRender": true,
     columns: [{
             data: "id"
         },
         {
             data: "name"
         },
         {
             data: "regcode"
         }
     ],
     columnDefs: [{
         "width": "20%",
         "targets": 0
     }]

 });



 $('#BranchTableMessage tbody').on('click', 'tr', function () {
     var table = $('#BranchTableMessage').DataTable();
     var data = table.row(this).data();
     var data1 = JSON.parse(JSON.stringify(data));
     console.log(data1);
     brachTableMessage = data;
 });




 $("#SemTableMessage").dataTable({
     data: semDataSet,
     responsive: true,
     bLengthChange: false,
     bFilter: false,
     bInfo: false,
     paging: false,
     //"deferRender": true,
     columns: [{
             data: 'id'
         },
         {
             data: 'name'
         }

     ]

 });


 $('#SemTableMessage tbody').on('click', 'tr', function () {
     var table = $('#SemTableMessage').DataTable();
     var data = table.row(this).data();
     var data1 = JSON.stringify(data)
     console.log(data1);
     semTableMessage = data;
 });

 $("#sendMsg").on('click', function () {
     // get the values of the subject and body fields

    var subject = $("messageSubject").val();
     var details = $("#messageDetails").val();



     var msg = {};
     msg["subject"] = subject;
     msg["details"] = details;

     msg["branchDTO"] = brachTableMessage;
     msg["semDTO"] = semTableMessage;

     var myurl = "api/broadcast";
     ajaxRequest(msg, "POST", myurl, processMsgSuccess1, null);

     return false;
 });


    

    



    
   


    

   

    /*
    Units Table End
    */


	




    /*
    Users Table Ends
    */

});
