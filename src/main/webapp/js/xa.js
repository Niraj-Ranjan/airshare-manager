$(document).ready(function() {

    $("a[data-toggle=\"tab\"]").on("shown.bs.tab", function(e) {
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust()
            .responsive.recalc();

        setStorageData(KEY_STATE, $(this).attr('data-target'));
    });

    var tb = getStorageData(KEY_STATE);


    if (tb != null) {
        // soctab
        $('#myTab a[data-target="' + tb + '"]').tab('show');
    }

	var societyDataSet = [];
        
    var populateSocTable = function(data) {
		societyDataSet = [];
		var tb = $("#SocietyTable").dataTable();
		tb.fnClearTable();
        var socdata = [];
        socdata = data.data;
        for (i = 0; i < socdata.length; i++) {
            var tempdata = [];

            tempdata.push(htmlEncode(socdata[i].name));
            if (socdata[i].registrationCode != null)
                tempdata.push(htmlEncode(socdata[i].registrationCode));
            else
                tempdata.push("");

            if (socdata[i].active == true || socdata[i].active == null)
                tempdata.push("Active");
            else
                tempdata.push("InActive");

            //tempdata.push(socdata[i].address.line1);
			if(socdata[i].address != null && socdata[i].address.city != null){
				tempdata.push(htmlEncode(socdata[i].address.city.name));
			}else{
				tempdata.push("");
			}
            if (socdata[i].numOfunit != null)
                tempdata.push(htmlEncode(socdata[i].numOfunit));
            else
                tempdata.push("");
			if(socdata[i].contact != null){
				tempdata.push(htmlEncode(socdata[i].contact.firstName + ' ' + socdata[i].contact.lastName));
			}else{
				tempdata.push("");
			}
			
			var licenseInfo = "";
			var expiryInfo = "";
			
			if(socdata[i].subscriptions != null){
				for(var k=0; k< socdata[i].subscriptions.length; k++){
					if(k > 0){
						licenseInfo += ", ";
						expiryInfo += ", ";
					}
					licenseInfo += socdata[i].subscriptions[k].license.name;
					expiryInfo += formatDate(socdata[i].subscriptions[k].endDate);
				}
			}
			
            tempdata.push(htmlEncode(licenseInfo));
			tempdata.push(htmlEncode(expiryInfo));
            tempdata.push(htmlEncode(socdata[i].remark));
            tempdata.push(socdata[i].id);
            societyDataSet.push(tempdata);

        }
		
            
		if(societyDataSet != null && societyDataSet.length > 0){
			tb.fnAddData(societyDataSet);
		}
	};

	var table = $("#SocietyTable").dataTable({
		data: societyDataSet,
		responsive: true,
		bLengthChange: false,
		//"deferRender": true,
		columns: [
					{ title: "Name" },
					{ title: "Code" },
					{ title: "Status" },
					{ title: "City" },
					{ title: "Unit Size" },
					{ title: "Contact" },
					{ title: "Subscriptions",
						"render": function(data, type, row){
							return data.split(", ").join("<br/>");
						}
					},
					{
						title: "Expiry",
						"render": function(data, type, row){
							return data.split(", ").join("<br/>");
						}
					},
					{ title: "Remarks" },
					{ title: "ID" }
				],
		columnDefs: [{
			//ID
			"targets": [9],
			"visible": false,
			"searchable": false
		},
		{
			//dont show reg code 
			"targets": [1],
			"visible": false,
			"searchable": true
		},
		{
			//dont show unit size
			"targets": [4],
			"visible": false,
			"searchable": true
		},
		{
			//dont show contact
			"targets": [5],
			"visible": false,
			"searchable": true
		}
		]
	});

		
	var editSociety = function() {
		// pass the selected row to the edit page
		var table1 = $('#SocietyTable').DataTable();
		var tdata = table1.rows('.selected').data();
		var id = tdata[0][9];
		
		setStorageData(KEY_ORG_ID, id);
		setStorageData(KEY_ORG_NAME, tdata[0][0]);
		window.location.href = "../html/society.html?action=edit";
	};
        
	$('#editSoc').on('click', editSociety);
	$('#editSoc1').on('click', editSociety);

	actDeactSociety = function() {
		// pass the selected row to the edit page
		var table1 = $('#SocietyTable').DataTable();
		var tdata = table1.rows('.selected').data();
		var id = tdata[0][9];

		// a put request to activate/deactivate the society
		var status = tdata[0][2];
		var mydata = {};
		if (status == "InActive")
			mydata = {
				"active": true
			};
		else
			mydata = {
				"active": false
			};

		var postActivateSuccess = function(response) {
			getAllSocieties();
			showMessage('Society activated / deactivated successfully.', 'success');
			populateDashboard();
		};

		var acturl = "api/orgs/" + id + "/activation";

		ajaxRequest(mydata, "PUT", acturl, postActivateSuccess, 
			function(error) {
				console.log(error);
			}
		);
	};
        
	$('#deactSoc').on('click', actDeactSociety);
	$('#deactSoc1').on('click', actDeactSociety);
        
       
	var manageSociety = function() {
		// pass the selected row to the edit page
		var table1 = $('#SocietyTable').DataTable();
		var tdata = table1.rows('.selected').data();
		var id = tdata[0][9];
		setStorageData(KEY_ORG_ID, id);
		setStorageData(KEY_ORG_NAME, tdata[0][0]);
		window.location.href = "../html/society_details.html";
	};
        
	$('#detSoc').on('click', manageSociety);
    $('#detSoc1').on('click', manageSociety);

	$('#SocietyTable tbody').on('click', 'tr', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');

			$("#deactSoc").addClass('disabled');
			//$("#delSoc").addClass('disabled');
			$("#editSoc").addClass('disabled');
			$("#detSoc").addClass('disabled');

			$("#deactSoc1").addClass('disabled');
			//$("#delSoc1").addClass('disabled');
			$("#editSoc1").addClass('disabled');
			$("#detSoc1").addClass('disabled');

		} else {
			table.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
			$("#deactSoc").removeClass('disabled');
			//$("#delSoc").removeClass('disabled');
			$("#editSoc").removeClass('disabled');
			$("#detSoc").removeClass('disabled');

			$("#deactSoc1").removeClass('disabled');
			//$("#delSoc1").removeClass('disabled');
			$("#editSoc1").removeClass('disabled');
			$("#detSoc1").removeClass('disabled');
		}
	});

	$('#delSoc').click(function() {
		var table1 = $('#SocietyTable').DataTable();
		var tdata = table1.rows('.selected').data();
		table1.rows('.selected').remove().draw(false);

	});


	var getAllSocieties = function(){
		var mysocurl = "api/orgs";
		ajaxRequest(null, "GET", mysocurl, populateSocTable, null);
	};
	
	getAllSocieties();

    var licenseDataSet = [];
    var populateLicTable = function(data) {

        licenseData = data.data;
        for (i = 0; i < licenseData.length; i++) {
            var tempdata = [];
            tempdata.push(licenseData[i].id);
            tempdata.push(licenseData[i].name);
            tempdata.push(licenseData[i].details);
			
			var features = "";
			if(licenseData[i].features){
				for(var j=0; j<licenseData[i].features.length; j++){
					if(j > 0){
						features += ", ";
					}
					features += licenseData[i].features[j].name;
				}
			}
			
			tempdata.push(features);
            if (licenseData[i].active){
                tempdata.push("Active");
			}else{
                tempdata.push("InActive");
			}
            tempdata.push(licenseData[i].duration + ' ' + licenseData[i].durationUOMStr);
            tempdata.push(licenseData[i].currency.prefix + ' ' + licenseData[i].cost);
            tempdata.push(licenseData[i].type.name);
            licenseDataSet.push(tempdata);

        }

        var lictable = $("#LicenseTable").dataTable({
            data: licenseDataSet,
            responsive: true,
            bLengthChange: false,
            //"deferRender": true,
            columns: [
					{ title: "ID" }, 
					{ title: "Name" }, 
					{ title: "Details" }, 
					{ title: "Features" }, 
					{ title: "Status" }, 
					{ title: "Duration" }, 
					{ title: "Cost" }, 
					{ title: "Type" }
				],
            columnDefs: [{
                "targets": [0],
                "visible": false,
                "searchable": false
            }]
        });

        $('#LicenseTable tbody').on('click', 'tr', function() {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                $("#editLic").addClass('disabled');
                $("#editLic1").addClass('disabled');
            } else {
                lictable.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $("#editLic").removeClass('disabled');
                $("#editLic1").removeClass('disabled');
            }
        });
		
		var editLicFunc = function() {
            // pass the selected row to the edit page
            var lictable = $('#LicenseTable').DataTable();
            var tdata = lictable.rows('.selected').data();
            var id = tdata[0][0];
            setStorageData("licenseId", id);
            //window.location.href = "../html/edit_license.html";
			window.location.href = "../html/license.html?action=edit";
        };
		
        $('#editLic').on('click', editLicFunc);
		$('#editLic1').on('click', editLicFunc);

    };

    var licUrl = "api/licenses?allStatus=true";
    ajaxRequest(null, "GET", licUrl, populateLicTable, null);
	
    var historyDataSet = [];
    var populateHisTable = function(data) {
        //     
        historyData = data.data;
        for (i = 0; i < historyData.length; i++) {
            var tempdata = [];

            if(!isEmpty(historyData[i].actionBy)){
            	tempdata.push(historyData[i].actionBy.name);
            } else {
            	tempdata.push(" ");
            }
            tempdata.push(historyData[i].resourceName);
            tempdata.push(historyData[i].action);
			var histDate = new Date(historyData[i].actionDate);
			//var histDateStr = histDate.getDate()+ '/'+(histDate.getMonth()+1)+'/'+histDate.getFullYear()+ ' '+histDate.getHours()+":"+histDate.getMinutes()+':'+histDate.getSeconds();
			
			var histDateStr = histDate.toLocaleDateString() +" "+ histDate.toLocaleTimeString();
            tempdata.push(histDateStr);

            if (historyData[i].oldValue != null)
                tempdata.push(historyData[i].oldValue);
            else {
                tempdata.push(" ");
            }
            tempdata.push(historyData[i].newValue);

            historyDataSet.push(tempdata);

        }

        var histable = $("#HistoryTable").dataTable({
            data: historyDataSet,
            responsive: true,
            bLengthChange: false,
			order: [],
            //"deferRender": true,
            columns: [
					{ title: "Action By" },
                { title: "Resource" },
                { title: "Action" },
                { title: "Date" },
                { title: "Old Value" },
                { title: "New Value" }
            ]
        });

        $('#HistoryTable tbody').on('click', 'tr', function() {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');

                $("#deactSoc").addClass('disabled');
                $("#editSoc").addClass('disabled');
                $("#detSoc").addClass('disabled');
                //$("#delSoc").addClass('disabled');
				$("#deactSoc1").addClass('disabled');
                $("#editSoc1").addClass('disabled');
                $("#detSoc1").addClass('disabled');

            } else {
                histable.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $("#deactSoc").removeClass('disabled');
                $("#editSoc").removeClass('disabled');
                $("#detSoc").removeClass('disabled');
                //$("#delSoc").removeClass('disabled');
				$("#deactSoc1").removeClass('disabled');
                $("#editSoc1").removeClass('disabled');
                $("#detSoc1").removeClass('disabled');
                
            }
        });
    };

    var hisUrl = "api/audits";
    ajaxRequest(null, "GET", hisUrl, populateHisTable, null);

	var populateOrgDash = function(response) {
        var dashData = response.data;
        $("#d1").html(dashData[0].displayText);
        $("#d2").html(dashData[1].displayText);
        $("#d3").html(dashData[2].displayText);
        $("#d4").html(dashData[3].displayText);


        $("#v1").html(dashData[0].value);
        $("#v2").html(dashData[1].value);
        $("#v3").html(dashData[2].value);
        $("#v4").html(dashData[3].value);

		$("#dashLoadingDiv").hide();
		$("#dashboardDiv").show();

    };
	
	var populateDashboard = function(){
		$("#dashLoadingDiv").show();
		$("#dashboardDiv").hide();
		var dashUrl = "api/dashboards/admin";
		ajaxRequest(null, "GET", dashUrl, populateOrgDash, null);
	}
    populateDashboard();
    
    
});