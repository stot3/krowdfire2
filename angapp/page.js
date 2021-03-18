var a2a_config = a2a_config || {};
	//specifically for twitter
	a2a_config.locale = "custom";
	a2a_config.localize  = {
     share_message:"I just made a contribution to"
	};
	
 // for all media
   a2a_config.linkname = a2a_config.localize.share_message;
   var myString=window.location.href;
   // console.log(myString);
   var stringArray=myString.split('pledge');
   var id=stringArray[1].split('eid=');
   var myurl=stringArray[0] + "campaign/" + id[1];
    
	// console.log(myurl);
	 a2a_config.linkurl =myurl;