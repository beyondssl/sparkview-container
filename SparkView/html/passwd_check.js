function char_count(){
   //Über die DOM-Methode document.getElementById wird der Wert aus dem Eingabefeld geholt
   //Using the DOM-Methode document.getElementById pick the value from the data field and move it to the variable val.
   
   var val = document.getElementById('eingabe').value;
   
   var call = document.getElementById('feedback');
   var button = document.getElementsByClassName("submitButton")[0];
            
   //The status of the password can be: "To Short", Unsecure", Secure" or "Higly Secure"
   
   //Is the password length min. 8?
    if (val.length > 8)  
   {    
        
      //If the password includes letters and min. one digit
	  //and min. one Special character, the password is "highly secure"
         
      if (val.match(/\d{1,}/) && val.match(/[a-zA-Z]{1,}/) && val.match(/\W/)) 
        {   
      call.style.color="#428c0d";               
      call.innerHTML = "<strong>Highly Secure!</strong>";
	  button.style.display = "block";
        }
         
		//If the password includes only one digit or one special character, the password is "secure"
        else if (val.match(/\d{1,}/) && val.match(/[a-zA-Z]{1,}/) || val.match(/\W/) && val.match(/[a-zA-Z]{1,}/)) 
        {   
    call.style.color="#56a40c"; 
    call.innerHTML = "<strong>Secure!</strong>";
	button.style.display = "block";
        }
        else //the password includes no digits and no special character, it's unsecure!
        {   
         
    call.style.color="#ff9410"; 
    call.innerHTML = "<strong>Unsecore!</strong>";
	button.style.display = "none";
	}
	
    } 
    else //The password is: "too short"
    {
    call.style.color="#ff352c"; 
    call.innerHTML = "<strong>Too Short!</strong>";
	button.style.display = "none";
	}               
	};